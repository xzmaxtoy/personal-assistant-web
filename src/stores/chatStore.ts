import { create } from 'zustand';
import { Message, ChatSession } from '@/types/chat';

interface ChatState {
  sessions: Record<string, ChatSession>;
  currentSessionId: string | null;

  // Actions
  createSession: (projectId: string, projectPath: string) => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  setStreaming: (sessionId: string, streaming: boolean) => void;
  clearSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: {},
  currentSessionId: null,

  createSession: (projectId, projectPath) => {
    const sessionId = `${projectId}-${Date.now()}`;
    set((state) => ({
      sessions: {
        ...state.sessions,
        [sessionId]: {
          projectId,
          projectPath,
          messages: [],
          isStreaming: false
        }
      },
      currentSessionId: sessionId
    }));
  },

  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  addMessage: (sessionId, message) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    set((state) => ({
      sessions: {
        ...state.sessions,
        [sessionId]: {
          ...state.sessions[sessionId],
          messages: [...(state.sessions[sessionId]?.messages || []), newMessage]
        }
      }
    }));
  },

  updateMessage: (sessionId, messageId, updates) => {
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session) return state;

      return {
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            messages: session.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            )
          }
        }
      };
    });
  },

  setStreaming: (sessionId, streaming) => {
    set((state) => ({
      sessions: {
        ...state.sessions,
        [sessionId]: {
          ...state.sessions[sessionId],
          isStreaming: streaming
        }
      }
    }));
  },

  clearSession: (sessionId) => {
    set((state) => {
      const newSessions = { ...state.sessions };
      delete newSessions[sessionId];
      return { sessions: newSessions };
    });
  }
}));
