import { create } from 'zustand';
import { getGoogleIdToken, clearChromeToken } from '../lib/chrome';

interface UserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initFromStorage: () => Promise<void>;
}

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_INFO: 'auth_user_info',
  LAST_SYNC: 'auth_last_sync'
} as const;

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  userInfo: null,
  isLoading: false,
  error: null,

  initFromStorage: async () => {
    try {
      set({ isLoading: true, error: null });
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER_INFO,
        STORAGE_KEYS.LAST_SYNC
      ]);

      const lastSync = result[STORAGE_KEYS.LAST_SYNC];
      const now = Date.now();
      const tokenExpired = !lastSync || (now - lastSync) > 24 * 60 * 60 * 1000; // 24 hours

      if (tokenExpired) {
        await chrome.storage.local.remove([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.USER_INFO,
          STORAGE_KEYS.LAST_SYNC
        ]);
        set({ token: null, userInfo: null, isLoading: false });
        return;
      }

      if (result[STORAGE_KEYS.TOKEN] && result[STORAGE_KEYS.USER_INFO]) {
        set({
          token: result[STORAGE_KEYS.TOKEN],
          userInfo: result[STORAGE_KEYS.USER_INFO],
          isLoading: false
        });
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to restore auth state';
      set({ error, isLoading: false });
    }
  },

  signIn: async () => {
    try {
      set({ isLoading: true, error: null });
      const { token, userInfo } = await getGoogleIdToken();
      
      // Store with timestamp
      await chrome.storage.local.set({
        [STORAGE_KEYS.TOKEN]: token,
        [STORAGE_KEYS.USER_INFO]: userInfo,
        [STORAGE_KEYS.LAST_SYNC]: Date.now()
      });

      set({ token, userInfo, isLoading: false });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await clearChromeToken();
      
      // Clear all auth data
      await chrome.storage.local.remove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER_INFO,
        STORAGE_KEYS.LAST_SYNC
      ]);

      set({ token: null, userInfo: null, isLoading: false });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error, isLoading: false });
    }
  }
})); 