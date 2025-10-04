# Personal Assistant Web UI

Modern web interface for Personal Assistant automation system, powered by Claude Agent SDK.

## Features

- 🤖 **Claude Agent SDK Integration** - Native agent support with subscription auth
- 📊 **Dashboard Interface** - Clean web UI for PA automation workflows
- 🔄 **Real-time Streaming** - Live chat responses from Claude agents
- 📁 **Project Management** - Switch between multiple Claude Code projects
- ⚡ **MCP Tools** - Notion, Mem0, Shopify, Chrome DevTools integration
- 🎯 **Task Triggers** - Quick actions for "start today's analysis", maintenance, etc.

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management

### Backend
- **Node.js + Express** - API server
- **Claude Agent SDK** - AI agent integration
- **TypeScript** - Type safety
- **MCP Servers** - Tool ecosystem (Notion, Mem0, Shopify, etc.)

## Quick Start

### Prerequisites

- Node.js 18+ (with npm)
- Claude Code CLI installed and authenticated
- Personal Assistant project at `/Users/jessexu/Personal Assistant`

### Installation

```bash
# Navigate to project directory
cd "/Users/jessexu/Personal Assistant/personal-assistant-web"

# Install dependencies
npm install

# Start development servers (frontend + backend)
npm run dev:all
```

### Development Servers

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express API server)

### Individual Commands

```bash
# Frontend only
npm run dev

# Backend only
npm run server:dev

# Both servers concurrently
npm run dev:all
```

## Project Structure

```
personal-assistant-web/
├── src/                      # Frontend (React + Vite)
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── layout/          # Dashboard, Header, Sidebar
│   │   ├── chat/            # Claude session chat
│   │   ├── project/         # Project selector
│   │   └── pa/              # PA-specific components
│   ├── lib/                 # Utilities
│   ├── hooks/               # React hooks
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript types
│
├── server/                   # Backend (Express + Agent SDK)
│   ├── routes/              # API endpoints
│   │   ├── chat.ts          # POST /api/chat (streaming)
│   │   └── projects.ts      # GET /api/projects
│   ├── services/
│   │   ├── agentService.ts  # Agent SDK integration
│   │   ├── projectService.ts # Project discovery
│   │   └── commandRouter.ts # PA task detection
│   ├── config/
│   │   ├── mcp-config.ts    # MCP server configuration
│   │   └── pa-config.ts     # PA system configuration
│   └── index.ts             # Express server entry
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Configuration

### Backend Environment Variables

Edit `server/.env`:

```env
# Server Configuration
PORT=3001

# Personal Assistant Root
PA_ROOT=/Users/jessexu/Personal Assistant

# MCP Server Credentials
NOTION_TOKEN=your_notion_token
MEM0_API_KEY=your_mem0_key
MEM0_ORG_ID=your_org_id
MEM0_PROJECT_ID=your_project_id
```

### MCP Servers

Configured in `server/config/mcp-config.ts`:

- **notionApi** - Notion database operations
- **mem0** - Memory system (Mem0.ai)
- **shopify-dev-mcp** - Shopify tools
- **mcp-graphql** - GraphQL queries
- **chrome-devtools** - Browser automation
- **gemini-cli** - Gemini AI integration

## API Endpoints

### Chat

**POST /api/chat** - Stream chat responses

```json
{
  "projectPath": "/Users/jessexu/Personal Assistant",
  "message": "start today's analysis"
}
```

Returns: Server-Sent Events stream

### Projects

**GET /api/projects** - List all Claude Code projects

```json
{
  "projects": [
    {
      "id": "personal-assistant",
      "name": "Personal Assistant",
      "path": "/Users/jessexu/Personal Assistant",
      "hasClaudeConfig": true
    }
  ]
}
```

## Agent SDK Features

### Built-in Tools (Auto-Available)

- File operations: Read, Write, Edit, MultiEdit
- Code execution: Bash, BashOutput, KillBash
- Search: Glob, Grep
- Web: WebFetch, WebSearch
- Agents: Task, TodoWrite

### MCP Tools (Configured)

- `mcp__notionApi__*` - All Notion API operations
- `mcp__mem0__*` - Memory add/search/delete
- `mcp__shopify-dev-mcp__*` - Shopify business intelligence
- `mcp__chrome-devtools__*` - Browser automation

### PA Task Triggers

Commands automatically detected and routed:

- "start today's analysis" → `pa-browser-analysis-specialist`
- "run maintenance" → `pa-maintenance`
- "daily brief" → `morning-planning`
- "bradoria weekly report" → `bradoria-analysis`

## Development Workflow

### Phase 1 (Current)

- ✅ Project structure created
- ✅ Backend with Agent SDK integration
- ✅ MCP servers configured
- ✅ Basic frontend setup
- ⏳ Dashboard UI (next)

### Phase 2 (Next)

- Project selector component
- Claude session chat interface
- Streaming message display
- Tool execution visualization

### Phase 3 (Future)

- PA Quick Actions panel
- Results viewer
- Business area dashboard
- Analytics and insights

## Troubleshooting

### Agent SDK authentication error

Ensure Claude Code is authenticated:

```bash
claude auth status
```

### MCP server connection issues

Check environment variables in `server/.env` and verify MCP servers are accessible.

### Port already in use

Change ports in:
- `server/.env` (PORT=3001)
- `vite.config.ts` (server.port: 5173)

## Next Steps

1. Install dependencies: `npm install`
2. Start servers: `npm run dev:all`
3. Open browser: http://localhost:5173
4. Test backend health: http://localhost:3001/health

Ready for Phase 2 implementation!

---

**Built with** ❤️ **for Personal Assistant automation**
