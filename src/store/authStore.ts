import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { authService } from '@/services';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      loading: false,
      initialized: false,
      error: null,

      requestOtp: async (phone) => {
        set({ loading: true, error: null });
        try {
          await authService.requestOtp(phone);
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      verifyOtp: async (phone, otp) => {
        set({ loading: true, error: null });
        try {
          const user = await authService.verifyOtp(phone, otp);
          set({ user, initialized: true });
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      quickLogin: async (role: UserRole) => {
        set({ loading: true, error: null });
        try {
          const user = await authService.quickLogin(role);
          set({ user, initialized: true });
        } catch (e) {
          set({ error: (e as Error).message });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        await authService.logout();
        set({ user: null });
      },

      hydrate: async () => {
        try {
          const user = await authService.getSession();
          set({ user, initialized: true });
        } catch {
          set({ user: null, initialized: true });
        }
      },
    }),
    { name: 'auth' }
  )
);
