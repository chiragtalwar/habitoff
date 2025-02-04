import React, { useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/AuthContext';

export const TestPaymentFlow: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading, error, isPremium, startSubscription } = useSubscription();

  // Log component mount and subscription changes
  useEffect(() => {
    console.log('[PaymentTest] Component mounted', {
      userId: user?.id,
      isAuthenticated: !!user,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        plan_type: subscription.plan_type
      } : null
    });

    return () => {
      console.log('[PaymentTest] Component unmounted');
    };
  }, [user, subscription]);

  // Log subscription status changes
  useEffect(() => {
    if (subscription) {
      console.log('[PaymentTest] Subscription status updated', {
        status: subscription.status,
        plan_type: subscription.plan_type,
        isPremium
      });
    }
  }, [subscription, isPremium]);

  const handleTestPayment = async () => {
    console.log('[PaymentTest] Starting payment flow', {
      userId: user?.id,
      email: user?.email
    });

    try {
      await startSubscription();
      console.log('[PaymentTest] Payment flow initiated successfully');
    } catch (err) {
      console.error('[PaymentTest] Payment flow error:', err);
      // Log to your error tracking service here if needed
    }
  };

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('[PaymentTest] Error state:', error);
    }
  }, [error]);

  return (
    <div className="p-4 border rounded-lg shadow-sm space-y-4 max-w-md mx-auto my-8 bg-white/10 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">Payment Integration Test</h2>
      
      <div className="space-y-2 text-white/90">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Premium Status:</strong> {isPremium ? 'Premium' : 'Free'}</p>
        <p><strong>Subscription Status:</strong> {subscription?.status || 'None'}</p>
        {error && (
          <p className="text-red-400">
            <strong>Error:</strong> {error.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleTestPayment}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? 'Processing...' : 'Test Payment Flow'}
        </button>

        {subscription && (
          <div className="text-sm text-white/80 mt-4 space-y-1">
            <p><strong>Subscription ID:</strong> {subscription.id}</p>
            <p><strong>Plan Type:</strong> {subscription.plan_type}</p>
            {subscription.trial_end && (
              <p><strong>Trial Ends:</strong> {new Date(subscription.trial_end).toLocaleDateString()}</p>
            )}
            {subscription.current_period_end && (
              <p><strong>Current Period Ends:</strong> {new Date(subscription.current_period_end).toLocaleDateString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 