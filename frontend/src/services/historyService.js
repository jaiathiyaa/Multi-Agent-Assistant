import api from '../api/axios';

export const historyService = {
  getSessionQueries: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/queries`);
    return response.data;
  },
};
