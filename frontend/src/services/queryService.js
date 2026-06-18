import api from '../api/axios';

export const queryService = {
  askQuestion: async (sessionId, question) => {
    const response = await api.post('/query', {
      session_id: sessionId,
      question: question,
    });
    return response.data;
  },

  getQueryTrace: async (queryId) => {
    const response = await api.get(`/queries/${queryId}/trace`);
    return response.data;
  },
};
