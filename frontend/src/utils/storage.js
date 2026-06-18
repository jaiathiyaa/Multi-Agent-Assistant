const TOKEN_KEY = 'doc_ai_token';
const USER_KEY = 'doc_ai_user';

export const storage = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
