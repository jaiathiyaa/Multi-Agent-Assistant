import api from '../api/axios';

export const sessionService = {
  getSessions: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },

  createSession: async (title = 'New Chat') => {
    const response = await api.post('/sessions', { title });
    return response.data;
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },
};
