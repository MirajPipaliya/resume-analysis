import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: { id: 1, username: 'demo_admin', role: 'Admin' },
  isAuthenticated: true,
  isLoading: false,
  
  login: async (username, password) => {
    set({ user: { id: 1, username: 'demo_admin', role: 'Admin' }, isAuthenticated: true });
    return true;
  },
  
  setAuth: (user, access, refresh) => {
    set({ user: { id: 1, username: 'demo_admin', role: 'Admin' }, isAuthenticated: true });
  },
  
  logout: async () => {
    console.log("Logout is disabled in demo mode.");
  },
  
  initAuth: () => {
    set({ user: { id: 1, username: 'demo_admin', role: 'Admin' }, isAuthenticated: true });
  }
}));

export default useAuthStore;
