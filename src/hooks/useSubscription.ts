import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types/subscription';
import { dodoPayments } from '../lib/dodoPayments';


export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Compute premium status - include both premium and lifetime plans
  const isPremium = subscription?.status === 'active' && 
    (subscription.plan_type === 'premium' || subscription.plan_type === 'lifetime');

  useEffect(() => {
    if (!user) return;

    // Fetch subscription data
    const fetchSubscription = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (supabaseError) {
          setError(new Error(supabaseError.message));
          return;
        }

        // For lifetime members, ensure current_period_end is null
        if (data && data.plan_type === 'lifetime') {
          data.current_period_end = null;
        }

        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const startSubscription = async (isLifetime: boolean = false) => {
    if (!user?.id || !user?.email) {
      setError(new Error('User must be logged in to start subscription'));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { url } = await dodoPayments.createCheckoutSession({
        userId: user.id,
        email: user.email,
        isLifetime
      });
      
      window.location.href = url;
    } catch (err) {
      console.error('Failed to start subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to start subscription'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { subscription, loading, error, isPremium, startSubscription };
}