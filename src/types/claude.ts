// Enhanced message types for Claude Agent SDK responses
export interface ClaudeStreamMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'result' | 'tool_use' | 'tool_result' | 'init' | 'debug';
  timestamp: number;

  // Text content for user/assistant messages
  content?: string;

  // System initialization data
  sessionId?: string;
  model?: string;
  tools?: string[];

  // Tool execution data
  toolName?: string;
  toolInput?: any;
  toolResult?: any;
  toolId?: string;

  // Result metadata
  success?: boolean;
  duration?: number;
  cost?: number;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };

  // Message metadata
  messageId?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ToolExecution {
  id: string;
  name: string;
  input: any;
  result?: any;
  isComplete: boolean;
  startTime: number;
  endTime?: number;
  error?: string;
}

export interface ChatSession {
  sessionId: string;
  model: string;
  tools: string[];
  messages: ClaudeStreamMessage[];
  toolExecutions: Map<string, ToolExecution>;
  totalCost: number;
  totalTokens: number;
}