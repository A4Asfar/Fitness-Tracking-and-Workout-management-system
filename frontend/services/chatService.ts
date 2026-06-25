import api from './api';

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export interface Conversation {
  _id: string;
  title: string;
  lastMessageAt: string;
  preview: string;
  messageCount: number;
}

export interface ConversationDetail {
  _id: string;
  title: string;
  messages: ChatMessage[];
}

export const ChatService = {
  /**
   * Send a message to the AI. If chatId is provided, continues that conversation.
   * If no chatId, creates a new conversation automatically.
   */
  sendMessage: async (message: string, chatId?: string) => {
    const payload: any = { message };
    if (chatId) payload.chatId = chatId;
    const response = await api.post('/chat/ai', payload);
    return response.data as { reply: string; chatId: string; title: string };
  },

  /**
   * Get all conversations for the current user
   */
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chat/ai/conversations');
    return response.data;
  },

  /**
   * Get messages for a specific conversation
   */
  getHistory: async (chatId: string): Promise<ConversationDetail> => {
    const response = await api.get(`/chat/ai/${chatId}`);
    return response.data;
  },

  /**
   * Create a new empty conversation
   */
  createConversation: async (): Promise<Conversation> => {
    const response = await api.post('/chat/ai/new');
    return response.data;
  },

  /**
   * Rename a conversation
   */
  renameConversation: async (chatId: string, title: string) => {
    const response = await api.put(`/chat/ai/${chatId}/rename`, { title });
    return response.data;
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (chatId: string) => {
    const response = await api.delete(`/chat/ai/${chatId}`);
    return response.data;
  },
};
