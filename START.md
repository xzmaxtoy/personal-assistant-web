# Starting Personal Assistant Web UI

## Quick Start

```bash
cd "/Users/jessexu/Personal Assistant/personal-assistant-web"

# Start both frontend and backend
npm run dev:all
```

This will start:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express + Agent SDK)

## Individual Commands

```bash
# Frontend only
npm run dev

# Backend only
npm run server:dev
```

## What You'll See

1. **Header**: Personal Assistant title + Project Selector dropdown
2. **Sidebar**: Navigation (Chat, Dashboard, Settings)
3. **Main Area**: Claude Session chat interface
4. **Project Selector**: Lists all Claude Code projects (scans for `.claude/` directories)

## Current State

✅ **Phase 1 Complete**: Dashboard UI with project selector
⏳ **Phase 2 Next**: Implement chat streaming with Agent SDK

## Testing

1. Open http://localhost:5173 in your browser
2. Project selector should load "Personal Assistant" project
3. UI should show empty chat interface ready for messages
4. Backend health check: http://localhost:3001/health

## Stopping Servers

Press `Ctrl+C` in terminal to stop both servers.
