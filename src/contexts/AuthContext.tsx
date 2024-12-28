import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, signIn, signOut, initFromStorage } = useAuthStore();

  // Initialize from storage on mount
  useEffect(() => {
    console.log('Initializing auth from storage...');
    initFromStorage();
  }, [initFromStorage]);

  // Monitor auth state changes
  useEffect(() => {
    console.log('Setting up auth state monitoring...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        useAuthStore.setState({ user: session.user });
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null });
      }
    });

    return () => {
      console.log('Cleaning up auth state monitoring...');
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 	