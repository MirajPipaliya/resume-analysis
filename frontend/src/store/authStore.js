import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh, user } = response.data.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  setAuth: (user, access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    set({ user, isAuthenticated: true });
  },
  
  logout: async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false });
    }
  },
  
  initAuth: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Basic initialization, a real app might verify the token or fetch profile
      set({ isAuthenticated: true, user: { username: 'Admin' } });
    }
  }
}));

export default useAuthStore;
