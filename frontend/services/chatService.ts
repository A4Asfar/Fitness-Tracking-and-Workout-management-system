import api from './api';

export interface ChatLog {
  id?: string;
  question: string;
  response: string;
  timestamp?: string;
}

export const ChatService = {
  sendMessage: async (question: string) => {
    const response = await api.post('/chat', { question });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/chat');
    return response.data;
  }
};
