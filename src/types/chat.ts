export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
  tool?: ToolExecution;
}

export interface ToolExecution {
  name: string;
  input?: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface ChatSession {
  projectId: string;
  projectPath: string;
  messages: Message[];
  isStreaming: boolean;
}
