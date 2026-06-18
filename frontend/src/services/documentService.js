import api from '../api/axios';

export const documentService = {
  uploadDocument: async (sessionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/documents/uploads?session_id=${sessionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSessionDocuments: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/documents`);
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  getDocumentStatus: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/status`);
    return response.data;
  },
};
