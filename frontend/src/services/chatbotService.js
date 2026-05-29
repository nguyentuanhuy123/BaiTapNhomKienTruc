import axiosClient from '../api/axiosClient';

const api = axiosClient;

export const chatbotService = {
  /**
   * Send a chat message to the chatbot service
   * @param {string} prompt - User message prompt
   * @param {string} sessionId - Chat session ID
   */
  sendMessage: async (prompt, sessionId = 'default-session') => {
    try {
      const response = await api.post('/api/chatbot/chat', {
        prompt,
        sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }
};
