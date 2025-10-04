import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { query } from '@anthropic-ai/claude-agent-sdk';

// Load environment variables
dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory session storage (in production, use Redis or DB)
const projectSessions = new Map(); // projectId -> { sessions: [], currentSessionId }
const conversationHistory = new Map(); // sessionId -> { messages: [], metadata }

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Project discovery functions
function discoverProjects() {
  const projects = [];
  const rootPath = process.env.PA_ROOT || '/Users/jessexu/Personal Assistant';

  // Find directories with CLAUDE.md or .claude folder
  function scanDirectory(dirPath, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return;

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
          const entryPath = path.join(dirPath, entry.name);
          const claudeMdPath = path.join(entryPath, 'CLAUDE.md');
          const claudeDirPath = path.join(entryPath, '.claude');

          const hasClaudeConfig = fs.existsSync(claudeMdPath) || fs.existsSync(claudeDirPath);

          if (hasClaudeConfig) {
            projects.push({
              id: entry.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: entry.name,
              path: entryPath,
              hasClaudeConfig: true,
              lastModified: fs.statSync(entryPath).mtime
            });
          }

          // Recursively scan subdirectories
          scanDirectory(entryPath, maxDepth, currentDepth + 1);
        }
      }
    } catch (error) {
      console.warn(`[Projects] Could not scan directory: ${dirPath}`, error.message);
    }
  }

  // Scan the root PA directory
  scanDirectory(rootPath);

  // Always include the main Personal Assistant project
  if (!projects.find(p => p.name === 'Personal Assistant')) {
    projects.unshift({
      id: 'personal-assistant',
      name: 'Personal Assistant',
      path: rootPath,
      hasClaudeConfig: true,
      lastModified: new Date()
    });
  }

  return projects;
}

// Session management functions
function createSession(projectId) {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    id: sessionId,
    projectId,
    createdAt: new Date(),
    lastActivity: new Date(),
    messageCount: 0,
    model: 'claude-sonnet-4-5-20250929',
    toolsUsed: []
  };

  // Initialize project sessions if not exists
  if (!projectSessions.has(projectId)) {
    projectSessions.set(projectId, { sessions: [], currentSessionId: null });
  }

  const projectData = projectSessions.get(projectId);
  projectData.sessions.push(session);
  projectData.currentSessionId = sessionId;

  // Initialize conversation history
  conversationHistory.set(sessionId, {
    messages: [],
    metadata: { projectId, createdAt: session.createdAt }
  });

  return session;
}

function getProjectSessions(projectId) {
  const projectData = projectSessions.get(projectId);
  return projectData ? projectData.sessions : [];
}

function addMessageToSession(sessionId, message) {
  const history = conversationHistory.get(sessionId);
  if (history) {
    history.messages.push({
      ...message,
      timestamp: Date.now()
    });

    // Update session metadata
    const sessions = Array.from(projectSessions.values()).flatMap(p => p.sessions);
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.messageCount = history.messages.length;
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    paRoot: process.env.PA_ROOT || '/Users/jessexu/Personal Assistant'
  });
});

// Project discovery endpoint
app.get('/api/projects', (req, res) => {
  try {
    const projects = discoverProjects();
    res.json({
      projects,
      count: projects.length,
      rootPath: process.env.PA_ROOT || '/Users/jessexu/Personal Assistant'
    });
  } catch (error) {
    console.error('[Projects] Discovery error:', error);
    res.status(500).json({ error: 'Failed to discover projects' });
  }
});

// Session management endpoints
app.get('/api/projects/:projectId/sessions', (req, res) => {
  const { projectId } = req.params;
  const sessions = getProjectSessions(projectId);
  const projectData = projectSessions.get(projectId);

  res.json({
    sessions,
    currentSessionId: projectData?.currentSessionId || null,
    count: sessions.length
  });
});

app.post('/api/projects/:projectId/sessions', (req, res) => {
  const { projectId } = req.params;
  const session = createSession(projectId);

  res.json({
    session,
    success: true
  });
});

app.get('/api/sessions/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;
  const history = conversationHistory.get(sessionId);

  if (!history) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    messages: history.messages,
    metadata: history.metadata
  });
});

// Chat streaming endpoint with Agent SDK
app.post('/api/chat', async (req, res) => {
  const { projectPath, message, messages, sessionId: providedSessionId } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'Missing message'
    });
  }

  const workingDir = projectPath || process.env.PA_ROOT || '/Users/jessexu/Personal Assistant';

  // Determine project ID from path
  const projectId = projectPath ?
    path.basename(projectPath).toLowerCase().replace(/[^a-z0-9]/g, '-') :
    'personal-assistant';

  // Get or create session
  let sessionId = providedSessionId;
  if (!sessionId || !conversationHistory.has(sessionId)) {
    const session = createSession(projectId);
    sessionId = session.id;
  }

  // Add user message to history
  addMessageToSession(sessionId, {
    type: 'user',
    content: message
  });

  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    console.log('[Chat] Starting stream for:', message.substring(0, 50) + '...');
    console.log('[Chat] Working directory:', workingDir);

    // Call Agent SDK with proper configuration and settings loading
    const result = query({
      prompt: message,
      options: {
        workingDirectory: workingDir,
        model: "sonnet", // Default Claude model for cloud subscription
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code'
        },
        settingSources: ['project', 'user'], // Load CLAUDE.md files
        allowedTools: [
          'Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Grep', 'Glob',
          'Task', 'TodoWrite', 'WebFetch', 'WebSearch'
        ]
      }
    });

    let fullResponse = '';

    // Stream responses with detailed logging
    let chunkCount = 0;
    for await (const chunk of result) {
      chunkCount++;
      console.log('[Chat] Chunk #' + chunkCount + ':', JSON.stringify(chunk, null, 2));

      // Handle different Agent SDK chunk types
      if (chunk.type === 'system' && chunk.subtype === 'init') {
        // System initialization - send session info
        res.write(`data: ${JSON.stringify({
          type: 'init',
          sessionId: sessionId, // Use our session ID
          model: chunk.model || 'claude-sonnet-4-5-20250929',
          tools: chunk.tools || []
        })}\n\n`);
      } else if (chunk.type === 'assistant') {
        // Assistant message content
        const message = chunk.message;
        if (message.content && message.content[0] && message.content[0].type === 'text') {
          const text = message.content[0].text;
          fullResponse += text;
          res.write(`data: ${JSON.stringify({
            type: 'text',
            text: text,
            fullText: fullResponse,
            messageId: message.id
          })}\n\n`);
        }
      } else if (chunk.type === 'result') {
        // Final result with usage stats
        res.write(`data: ${JSON.stringify({
          type: 'result',
          success: !chunk.is_error,
          duration: chunk.duration_ms,
          usage: chunk.usage,
          cost: chunk.total_cost_usd
        })}\n\n`);
      } else if (chunk.type === 'text') {
        // Legacy text chunks (still support them)
        fullResponse += chunk.text;
        res.write(`data: ${JSON.stringify({
          type: 'text',
          text: chunk.text,
          fullText: fullResponse
        })}\n\n`);
      } else if (chunk.type === 'tool_use') {
        res.write(`data: ${JSON.stringify({
          type: 'tool_use',
          tool: chunk.name,
          input: chunk.input
        })}\n\n`);
      } else if (chunk.type === 'tool_result') {
        res.write(`data: ${JSON.stringify({
          type: 'tool_result',
          tool: chunk.name,
          result: chunk.result
        })}\n\n`);
      } else {
        // Handle any other chunk types
        console.log('[Chat] Unhandled chunk type:', chunk.type);
        res.write(`data: ${JSON.stringify({
          type: 'debug',
          data: chunk
        })}\n\n`);
      }
    }

    console.log('[Chat] Total chunks received:', chunkCount);

    console.log('[Chat] Stream completed. Total length:', fullResponse.length);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[Chat] Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Personal Assistant Web UI Backend');
  console.log('='.repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 PA Root: ${process.env.PA_ROOT}`);
  console.log(`🤖 Agent SDK: Ready (Phase 2)`);
  console.log('='.repeat(60));
});
