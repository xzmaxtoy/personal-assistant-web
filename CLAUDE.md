# Personal Assistant Web UI - Claude Code Instructions

Modern web interface for Personal Assistant automation system, powered by Claude Agent SDK.

## Project Overview

This is a production-ready web application that provides a modern chat interface for Claude Agent SDK integration. It replaces script-based automation with a rich UI while maintaining all Personal Assistant functionality through task-based commands and session management.

## Development Commands

### Quick Start
```bash
# Install dependencies (if needed)
npm install

# Start development servers (frontend + backend)
npm run dev:all

# Individual servers
npm run dev          # Frontend only (Vite)
npm run server:dev   # Backend only (Express)
```

### Build & Quality
```bash
# Build frontend
npm run build

# Type checking
npm run check        # Frontend TypeScript check
npm run server:build # Backend TypeScript build

# Preview production build
npm run preview
```

### Development Workflow
```bash
# Watch mode for backend development
npm run server:watch
```

## Architecture

### Tech Stack
- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Backend**: Express.js + Claude Agent SDK v0.1.5 + TypeScript
- **State**: Zustand with localStorage persistence
- **Animation**: Framer Motion
- **Chat**: Custom streaming implementation with Server-Sent Events

### Core Components

#### Backend (`server/`)
- **Agent SDK Integration**: Native Claude Code cloud subscription auth
- **Session Management**: Custom implementation (Agent SDK is stateless)
- **Project Discovery**: Automatic scanning for CLAUDE.md/.claude directories
- **Streaming Chat**: Server-Sent Events with rich tool feedback

#### Frontend (`src/`)
- **Dual-Sidebar Layout**: Task commands + session management
- **Rich Chat Interface**: Tool widgets, streaming responses, markdown support
- **Project Switching**: Dynamic project loading with session history
- **Tool Widgets**: Visual feedback for Read, Write, Bash, TodoWrite, etc.

## Key Implementation Details

### Claude Agent SDK Configuration
```javascript
// server/index.js
const result = query({
  prompt: message,
  options: {
    workingDirectory: workingDir,
    model: "sonnet", // Cloud subscription default
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
```

### Session Management Pattern
Since Agent SDK is stateless, we implement custom session persistence:
```javascript
// In-memory session storage (use Redis/DB for production)
const projectSessions = new Map(); // projectId -> { sessions: [], currentSessionId }
const conversationHistory = new Map(); // sessionId -> { messages: [], metadata }
```

### Task-Based Interface
Replace generic dropdowns with actual PA commands:
```typescript
// src/components/layout/TaskSidebar.tsx
const taskItems: TaskItem[] = [
  {
    name: 'Analytics & Reports',
    children: [
      { name: 'Daily Browser Analysis', command: 'start today\'s analysis' },
      { name: 'Business Intelligence', command: 'business intelligence report' }
    ]
  }
];
```

### Rich Feedback System
Visual tool execution widgets for enhanced UX:
```typescript
// src/components/tool-widgets/ToolWidgets.tsx
export const ToolWidget: React.FC<{
  toolName: string;
  input: any;
  result?: any;
  isComplete?: boolean;
}> = ({ toolName, input, result, isComplete }) => {
  // Visual tool execution with expandable input/output
};
```

## API Endpoints

### Chat Streaming
**POST /api/chat**
```json
{
  "projectPath": "/Users/jessexu/Personal Assistant",
  "message": "start today's analysis",
  "sessionId": "optional-existing-session"
}
```
Returns: Server-Sent Events stream with real-time responses

### Project Management
**GET /api/projects** - Discover all Claude Code projects
**GET /api/projects/:id/sessions** - Get project session history
**POST /api/projects/:id/sessions** - Create new session

## Development Patterns

### Component Structure
- **UI Components**: `/src/components/ui/` (shadcn/ui primitives)
- **Layout**: `/src/components/layout/` (dashboard structure)
- **Chat**: `/src/components/chat/` (conversation interface)
- **Widgets**: `/src/components/tool-widgets/` (tool feedback)

### State Management
```typescript
// src/stores/projectStore.ts
export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  currentProject: null,
  loadProjects: async () => {
    // Load from API with localStorage persistence
  }
}));
```

### Styling Conventions
- **Tailwind CSS v4**: Use direct CSS properties, not @apply
- **shadcn/ui**: Consistent component library
- **Responsive**: Mobile-first design patterns
- **Dark Mode**: next-themes integration

## Personal Assistant Integration

### Task Command Mapping
The sidebar contains actual PA automation commands:
- `"start today's analysis"` → Daily browser history analysis
- `"run maintenance"` → System health checks
- `"business intelligence report"` → Cross-business insights

### Project Discovery
Automatically finds Claude Code projects by scanning for:
- `CLAUDE.md` files
- `.claude/` directories
- Respects PA_ROOT environment variable

### Environment Setup
```env
# server/.env
PORT=3001
PA_ROOT=/Users/jessexu/Personal Assistant
```

## Troubleshooting

### Agent SDK Issues
- Ensure Claude Code is authenticated: `claude auth status`
- Use `"sonnet"` model name for cloud subscription
- Check systemPrompt preset configuration

### Build Issues
- Clean install: `rm -rf node_modules && npm install`
- Check Node.js version compatibility (v18+)
- Verify Tailwind CSS v4 configuration

### Session Management
- Sessions are in-memory (implement Redis for production)
- Project switching preserves session history
- Manual session restoration available in SessionSidebar

## Production Considerations

### Scalability
- Implement Redis for session storage
- Add database for conversation persistence
- Consider WebSocket upgrade from SSE

### Security
- Add authentication middleware
- Implement rate limiting
- Validate project path access

### Performance
- Add response caching
- Implement conversation pagination
- Optimize bundle size

## Architecture Decisions

### Why Custom Session Management?
Agent SDK is designed to be stateless, focusing on single-turn interactions. For a chat interface, we need conversation history and project context persistence.

### Why Dual-Sidebar Layout?
Separates task commands (left) from session management (right), providing clear UX for both PA automation and conversation tracking.

### Why Server-Sent Events?
SSE provides real-time streaming with automatic reconnection, perfect for Agent SDK's streaming responses and tool execution feedback.

## Public Project Notes

This project is designed as a public repository demonstrating:
- Modern Claude Agent SDK integration patterns
- Rich chat interface implementation
- Custom session management solutions
- Task-based automation UI design

The codebase serves as a reference for building production Agent SDK applications while maintaining clean architecture and user experience standards.