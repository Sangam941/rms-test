import { create } from 'zustand';

interface AuthStore {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (email, password) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@rms.com' && password === 'admin123') {
          set({ isAuthenticated: true, user: { id: '1', email } });
          localStorage.setItem('auth', JSON.stringify({ id: '1', email }));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  logout: () => {
    set({ isAuthenticated: false, user: null });
    localStorage.removeItem('auth');
  },

  checkAuth: () => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const user = JSON.parse(stored);
      set({ isAuthenticated: true, user });
      return true;
    }
    set({ isAuthenticated: false, user: null });
    return false;
  },
}));
