import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, userInfo, isLoading, error, signIn, signOut, initFromStorage } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // Update authentication state when token changes
  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const value = {
    user: userInfo ? {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    } : null,
    isAuthenticated,
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