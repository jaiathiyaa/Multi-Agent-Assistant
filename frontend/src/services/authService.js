import api from '../api/axios';
import { storage } from '../utils/storage';

export const authService = {
  signup: async (username, email, password) => {
    const response = await api.post('/signup', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/login', {
      email,
      password,
    });
    const { access_token } = response.data;
    storage.setToken(access_token);
    
    // Fetch user details immediately after login
    const user = await authService.getCurrentUser();
    storage.setUser(user);
    
    return { token: access_token, user };
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout: () => {
    storage.clearAll();
  },
};
