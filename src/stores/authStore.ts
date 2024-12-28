import { create } from 'zustand';
import { getGoogleIdToken } from '../utils/getGoogleIdToken';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: false,
  error: null,

  initFromStorage: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        set({ user: session.user });
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to restore auth state';
      set({ error });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async () => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Starting Google sign-in flow...');
      const idToken = await getGoogleIdToken();
      console.log('Got Google ID token');
      
      console.log('Signing in with Supabase...');
      const { data: { user }, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (signInError) {
        console.error('Supabase sign-in error:', signInError);
        throw signInError;
      }
      if (!user) throw new Error('No user data returned');
      
      console.log('Successfully signed in with Supabase, creating profile...');
      console.log('User metadata:', user.user_metadata);

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Profile created/updated successfully');
      set({ user, isLoading: false });
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      const error = err instanceof Error ? err.message : 'Failed to sign in';
      set({ error, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to sign out';
      set({ error });
    } finally {
      set({ isLoading: false });
    }
  }
})); 