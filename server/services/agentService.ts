import { query } from '@anthropic-ai/claude-agent-sdk';
import { PA_CONFIG } from '../config/pa-config.js';
import { MCP_CONFIG } from '../config/mcp-config.js';

export interface ChatOptions {
  projectPath: string;
  message: string;
  allowedTools?: string[];
}

export interface AgentMessage {
  type: 'text' | 'tool_use' | 'tool_result' | 'error';
  text?: string;
  tool?: {
    name: string;
    input?: any;
    output?: any;
  };
  error?: string;
}

/**
 * Stream chat responses from Claude Agent SDK
 */
export async function* streamChatResponse(
  options: ChatOptions
): AsyncGenerator<AgentMessage> {
  const { projectPath, message, allowedTools } = options;

  try {
    // Call Agent SDK with PA configuration
    const result = query({
      prompt: message,
      options: {
        // Set working directory to PA project
        workingDirectory: projectPath,

        // Enable MCP servers
        mcpServers: MCP_CONFIG.mcpServers,

        // Load .claude/ settings
        settingSources: PA_CONFIG.agentOptions.settingSources,

        // Tool permissions
        allowedTools: allowedTools || PA_CONFIG.agentOptions.allowedTools,

        // Model selection
        model: PA_CONFIG.agentOptions.model
      }
    });

    // Stream messages from SDK
    for await (const message of result) {
      yield message as AgentMessage;
    }
  } catch (error: any) {
    console.error('Agent SDK error:', error);
    yield {
      type: 'error',
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Send a single message and get complete response (non-streaming)
 */
export async function sendMessage(options: ChatOptions): Promise<string> {
  let fullResponse = '';

  for await (const chunk of streamChatResponse(options)) {
    if (chunk.type === 'text' && chunk.text) {
      fullResponse += chunk.text;
    }
  }

  return fullResponse;
}
