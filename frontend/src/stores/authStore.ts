import { create } from 'zustand';

export interface User {
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
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
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

const getValidToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }
  return token;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getValidToken(),
  refreshToken: localStorage.getItem('refreshToken'),
  user: getStoredUser(),
  isAuthenticated: !!getValidToken(),
  setAuth: (token, user, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ token, refreshToken: refreshToken || null, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));
