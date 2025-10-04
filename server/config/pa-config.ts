import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

export const PA_CONFIG = {
  // Personal Assistant project root
  projectRoot: process.env.PA_ROOT || '/Users/jessexu/Personal Assistant',

  // Task folders (from PERSONAL_ASSISTANT_TASKS.md)
  taskFolders: {
    browserAnalysis: 'daily-browser-analysis',
    maintenance: 'maintenance-tasks',
    socialMedia: 'social-media-post-generation',
    bradoria: 'bradoria-shopify-analysis'
  },

  // Trigger command to agent mapping
  triggerCommands: {
    'start today\'s analysis': 'pa-browser-analysis-specialist',
    'run maintenance': 'pa-maintenance',
    'maintenance check': 'pa-maintenance',
    'daily brief': 'morning-planning',
    'bradoria weekly report': 'bradoria-analysis',
    'bradoria focus': 'bradoria-analysis',
    'shopify analysis': 'bradoria-analysis'
  },

  // Agent SDK default options
  agentOptions: {
    settingSources: ['filesystem' as const],

    // All available tools
    allowedTools: [
      // File & Code Operations
      'Read', 'Write', 'Edit', 'MultiEdit',
      'Bash', 'BashOutput', 'KillBash',
      'Glob', 'Grep',

      // Agent Management
      'Task', 'TodoWrite', 'ExitPlanMode',

      // Web Tools
      'WebFetch', 'WebSearch',

      // MCP Tools - Notion (Critical for PA)
      'mcp__notionApi__*',

      // MCP Tools - Mem0 Memory
      'mcp__mem0__*',

      // MCP Tools - Shopify
      'mcp__shopify-dev-mcp__*',
      'mcp__mcp-graphql__*',

      // MCP Tools - Chrome DevTools
      'mcp__chrome-devtools__*',

      // MCP Tools - Gemini
      'mcp__gemini-cli__*'
    ],

    // Default model
    model: 'claude-3-5-sonnet-20241022'
  }
};
