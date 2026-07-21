import { create } from 'zustand';

const savedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
})();

const useAuthStore = create((set) => ({
  user: savedUser || null,
  token: localStorage.getItem('token') || null,
  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;
