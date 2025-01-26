import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { subscriptionService, SubscriptionStatus } from '../services/subscriptionService';

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const status = await subscriptionService.getSubscriptionStatus(user.id);
      setSubscription(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  // Start trial for new users
  useEffect(() => {
    const startTrialIfNeeded = async () => {
      if (user && !subscription && !isLoading) {
        try {
          await subscriptionService.startTrial(user.id);
          await refreshSubscription();
        } catch (err) {
          console.error('Failed to start trial:', err);
        }
      }
    };

    startTrialIfNeeded();
  }, [user, subscription, isLoading]);

  // Refresh subscription status when user changes
  useEffect(() => {
    refreshSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, error, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 