'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useProjectStore } from '@/stores/projectStore';
import { StreamMessage } from './StreamMessage';
import type { ClaudeStreamMessage, ToolExecution } from '@/types/claude';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EnhancedClaudeSession() {
  const { currentProject } = useProjectStore();
  const [messages, setMessages] = useState<ClaudeStreamMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toolExecutions, setToolExecutions] = useState<Map<string, ToolExecution>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const scrollElement = scrollRef.current;
    const isAtBottom =
      Math.abs(scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight) < 50;

    shouldAutoScrollRef.current = isAtBottom;
  };

  const addMessage = (message: ClaudeStreamMessage) => {
    setMessages(prev => [...prev, {
      ...message,
      id: message.id || Date.now().toString(),
      timestamp: message.timestamp || Date.now()
    }]);
  };

  const updateToolExecution = (toolId: string, updates: Partial<ToolExecution>) => {
    setToolExecutions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(toolId);
      if (existing) {
        newMap.set(toolId, { ...existing, ...updates });
      }
      return newMap;
    });
  };

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    if (!input.trim() || isGenerating || !currentProject) return;

    // Add user message
    addMessage({
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: Date.now()
    });

    const userInput = input.trim();
    setInput('');
    setIsGenerating(true);

    try {
      // Call Agent SDK streaming endpoint
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectPath: currentProject.path,
          message: userInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      let currentAssistantMessage: ClaudeStreamMessage | null = null;
      let currentToolExecutions: Map<string, ToolExecution> = new Map();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              setIsGenerating(false);
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle different chunk types from Agent SDK
              switch (parsed.type) {
                case 'init':
                  addMessage({
                    id: `init-${Date.now()}`,
                    type: 'init',
                    sessionId: parsed.sessionId,
                    model: parsed.model,
                    tools: parsed.tools,
                    timestamp: Date.now()
                  });
                  break;

                case 'text':
                  if (!currentAssistantMessage) {
                    currentAssistantMessage = {
                      id: `assistant-${Date.now()}`,
                      type: 'assistant',
                      content: '',
                      messageId: parsed.messageId,
                      timestamp: Date.now()
                    };
                    addMessage(currentAssistantMessage);
                  }

                  // Update the current assistant message with new text
                  const updatedContent = parsed.fullText || parsed.text;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === currentAssistantMessage?.id
                        ? { ...msg, content: updatedContent }
                        : msg
                    )
                  );
                  break;

                case 'result':
                  addMessage({
                    id: `result-${Date.now()}`,
                    type: 'result',
                    content: 'Execution completed',
                    success: parsed.success,
                    duration: parsed.duration,
                    cost: parsed.cost,
                    usage: parsed.usage,
                    timestamp: Date.now()
                  });
                  break;

                case 'debug':
                  // Handle debug messages that contain tool information
                  if (parsed.data?.type === 'assistant' && parsed.data?.message?.content) {
                    const content = parsed.data.message.content;

                    // Look for tool use in assistant messages
                    if (Array.isArray(content)) {
                      content.forEach((item: any) => {
                        if (item.type === 'tool_use') {
                          const toolId = item.id;
                          const toolExecution: ToolExecution = {
                            id: toolId,
                            name: item.name,
                            input: item.input,
                            isComplete: false,
                            startTime: Date.now()
                          };

                          currentToolExecutions.set(toolId, toolExecution);
                          setToolExecutions(prev => new Map(prev).set(toolId, toolExecution));

                          // Add tool widget message
                          addMessage({
                            id: `tool-use-${toolId}`,
                            type: 'tool_use',
                            toolName: item.name,
                            toolInput: item.input,
                            toolId: toolId,
                            timestamp: Date.now()
                          });
                        }
                      });
                    }
                  }

                  // Handle tool results in user messages
                  if (parsed.data?.type === 'user' && parsed.data?.message?.content) {
                    const content = parsed.data.message.content;

                    if (Array.isArray(content)) {
                      content.forEach((item: any) => {
                        if (item.type === 'tool_result' && item.tool_use_id) {
                          const toolId = item.tool_use_id;
                          const toolExecution = currentToolExecutions.get(toolId);

                          if (toolExecution) {
                            const updatedExecution = {
                              ...toolExecution,
                              result: item.content,
                              isComplete: true,
                              endTime: Date.now(),
                              error: item.is_error ? item.content : undefined
                            };

                            currentToolExecutions.set(toolId, updatedExecution);
                            setToolExecutions(prev => new Map(prev).set(toolId, updatedExecution));

                            // Add tool result message
                            addMessage({
                              id: `tool-result-${toolId}`,
                              type: 'tool_result',
                              toolName: toolExecution.name,
                              toolInput: toolExecution.input,
                              toolResult: item.content,
                              toolId: toolId,
                              error: item.is_error ? item.content : undefined,
                              timestamp: Date.now()
                            });

                            // Special handling for TodoWrite results
                            if (toolExecution.name.toLowerCase() === 'todowrite') {
                              try {
                                const todos = toolExecution.input?.todos;
                                if (todos) {
                                  addMessage({
                                    id: `todo-${Date.now()}`,
                                    type: 'tool_result',
                                    toolName: 'TodoWrite',
                                    toolInput: { todos },
                                    toolResult: 'Todo list updated successfully',
                                    timestamp: Date.now()
                                  });
                                }
                              } catch (e) {
                                console.error('Error handling TodoWrite result:', e);
                              }
                            }
                          }
                        }
                      });
                    }
                  }
                  break;

                case 'error':
                  addMessage({
                    id: `error-${Date.now()}`,
                    type: 'result',
                    content: `Error: ${parsed.error}`,
                    success: false,
                    error: parsed.error,
                    timestamp: Date.now()
                  });
                  setIsGenerating(false);
                  break;
              }
            } catch (e) {
              // Ignore JSON parse errors for partial chunks
              console.warn('Failed to parse chunk:', data, e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: `error-${Date.now()}`,
        type: 'result',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      setIsGenerating(false);
    }
  };

  const stop = () => {
    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">No Project Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-500">
              Select a project from the header to start chatting with Claude.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full items-center justify-center"
          >
            <div className="text-center space-y-4 max-w-md">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Terminal className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to start coding</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a prompt below to begin your Claude Code session with rich feedback
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <StreamMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Streaming indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-4"
          >
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span>Claude is thinking...</span>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude to help with your project..."
            className="min-h-[60px] resize-none"
            disabled={isGenerating}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isGenerating}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
            {isGenerating && (
              <Button
                onClick={stop}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}