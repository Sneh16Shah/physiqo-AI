import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: ToastItem = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newItem] }));

    const duration = toast.duration || 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  showSuccess: (message, title = 'Success') => {
    useToastStore.getState().addToast({ type: 'success', title, message });
  },
  showError: (message, title = 'Error') => {
    useToastStore.getState().addToast({ type: 'error', title, message });
  },
  showInfo: (message, title = 'Information') => {
    useToastStore.getState().addToast({ type: 'info', title, message });
  },
}));

export const toast = {
  success: (message: string, title?: string) => useToastStore.getState().showSuccess(message, title),
  error: (message: string, title?: string) => useToastStore.getState().showError(message, title),
  info: (message: string, title?: string) => useToastStore.getState().showInfo(message, title),
};
