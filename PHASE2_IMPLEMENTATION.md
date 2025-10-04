# Phase 2: Chat Implementation with Agent SDK

## Overview
Implement streaming chat functionality with Claude Agent SDK integration, enabling real-time conversations with full Personal Assistant automation capabilities.

## Current Status
✅ **Phase 1 Complete**: Dashboard UI, Project Selector, Backend Server
⏳ **Phase 2 In Progress**: Chat streaming implementation

---

## Implementation Steps

### Step 1: Update Backend with Agent SDK Chat Endpoint

**File**: `server/index.js`

Add after the `/api/projects` endpoint:

```javascript
import { query } from '@anthropic-ai/claude-agent-sdk';

// Chat streaming endpoint
app.post('/api/chat', async (req, res) => {
  const { projectPath, message } = req.body;

  if (!projectPath || !message) {
    return res.status(400).json({
      error: 'Missing projectPath or message'
    });
  }

  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log('[Chat] Starting stream for:', message.substring(0, 50));

    // Call Agent SDK
    const result = query({
      prompt: message,
      options: {
        workingDirectory: projectPath,
        settingSources: ['filesystem'],
        allowedTools: [
          'Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob',
          'Task', 'TodoWrite', 'WebFetch', 'WebSearch'
        ],
        model: 'claude-3-5-sonnet-20241022'
      }
    });

    // Stream responses
    for await (const chunk of result) {
      const data = JSON.stringify(chunk);
      res.write(`data: ${data}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[Chat] Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});
```

### Step 2: Create Chat Hook

**File**: `src/hooks/useClaudeChat.ts`

```typescript
import { useState, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useProjectStore } from '@/stores/projectStore';

export function useClaudeChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const { currentProject } = useProjectStore();
  const { currentSessionId, addMessage, updateMessage, setStreaming } = useChatStore();

  const sendMessage = useCallback(async (message: string) => {
    if (!currentProject || !currentSessionId) return;

    // Add user message
    addMessage(currentSessionId, {
      role: 'user',
      content: message
    });

    // Create placeholder for assistant message
    const assistantMessageId = `msg-${Date.now()}`;
    addMessage(currentSessionId, {
      role: 'assistant',
      content: '',
      streaming: true
    });

    setIsStreaming(true);
    setStreaming(currentSessionId, true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: currentProject.path,
          message
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'text') {
                accumulatedText += parsed.text || '';
                updateMessage(currentSessionId, assistantMessageId, {
                  content: accumulatedText,
                  streaming: true
                });
              }

              if (parsed.type === 'tool_use') {
                // Handle tool execution display
                console.log('[Tool]', parsed.tool?.name);
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      // Mark as complete
      updateMessage(currentSessionId, assistantMessageId, {
        streaming: false
      });
    } catch (error) {
      console.error('[Chat] Error:', error);
    } finally {
      setIsStreaming(false);
      setStreaming(currentSessionId, false);
    }
  }, [currentProject, currentSessionId]);

  return { sendMessage, isStreaming };
}
```

### Step 3: Update ClaudeSession Component

**File**: `src/components/chat/ClaudeSession.tsx`

Replace the existing placeholder with full implementation:

```typescript
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/projectStore';
import { useChatStore } from '@/stores/chatStore';
import { useClaudeChat } from '@/hooks/useClaudeChat';
import { MessageSquare, Send } from 'lucide-react';
import { MessageList } from './MessageList';

export function ClaudeSession() {
  const { currentProject } = useProjectStore();
  const { sessions, currentSessionId, createSession } = useChatStore();
  const { sendMessage, isStreaming } = useClaudeChat();
  const [input, setInput] = useState('');

  // Create session when project changes
  useEffect(() => {
    if (currentProject && !currentSessionId) {
      createSession(currentProject.id, currentProject.path);
    }
  }, [currentProject, currentSessionId]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96 p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
          <p className="text-sm text-gray-500">
            Select a project from the header to start chatting.
          </p>
        </Card>
      </div>
    );
  }

  const currentSession = currentSessionId ? sessions[currentSessionId] : null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Claude Session
            </h2>
            <p className="text-sm text-gray-500">{currentProject.name}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto">
        <MessageList messages={currentSession?.messages || []} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or try 'start today's analysis'..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-6"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
        {isStreaming && (
          <p className="mt-2 text-xs text-gray-500">
            Claude is thinking...
          </p>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Create MessageList Component

**File**: `src/components/chat/MessageList.tsx`

```typescript
import { Message } from '@/types/chat';
import { MessageSquare, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Start a conversation
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Send a message to Claude or try Quick Actions like
            "start today's analysis"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
          )}

          <div
            className={`max-w-3xl rounded-lg px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {message.streaming && !message.content ? (
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {message.role === 'user' && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 flex-shrink-0">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Step 5: Test the Implementation

1. **Start the servers**:
```bash
npm run dev:all
```

2. **Open browser**: http://localhost:5173

3. **Test basic chat**:
   - Type "Hello" and send
   - Should see streaming response from Claude

4. **Test PA automation**:
   - Type "start today's analysis"
   - Should trigger pa-browser-analysis-specialist agent
   - Should see tool executions (Read, Bash, etc.)

---

## Next Steps (Phase 3)

- Add Quick Actions panel for common PA tasks
- Display tool executions with icons
- Show progress indicators for long-running tasks
- Add PA Results viewer
- Implement chat history persistence

---

**Ready to implement?** Run these commands to continue:

```bash
cd "/Users/jessexu/Personal Assistant/personal-assistant-web"

# The backend needs the Agent SDK chat endpoint added
# The frontend needs the chat components implemented
# Follow the code blocks above to complete Phase 2
```

**Current token usage**: ~130K/200K (69K remaining for implementation)
