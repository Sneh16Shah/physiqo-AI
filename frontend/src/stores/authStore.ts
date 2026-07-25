import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  preferences?: {
    unitSystem: 'metric' | 'imperial';
  };
  avatarUrl?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const getStoredUser = (): User | null => {
  try {
    const item = localStorage.getItem('user');
    return item ? JSON.parse(item) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
