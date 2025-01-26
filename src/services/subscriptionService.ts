import { supabase } from '../lib/supabase';
import DodoPayments from 'dodopayments';

// Initialize Dodo Payments client
const dodoClient = new DodoPayments({
  apiKey: import.meta.env.VITE_DODO_PAYMENTS_API_KEY,
  mode: import.meta.env.MODE === 'production' ? 'live' : 'test'
});

export interface SubscriptionStatus {
  isActive: boolean;
  isTrialing: boolean;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  plan: 'free' | 'premium';
}

class SubscriptionService {
  // Start 30-day trial for a new user
  async startTrial(userId: string): Promise<void> {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'trialing',
        plan_type: 'premium',
        trial_end: trialEndDate.toISOString(),
        current_period_end: trialEndDate.toISOString()
      });

    if (error) throw error;
  }

  // Get current subscription status
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no subscription found, user is on free plan
      return {
        isActive: false,
        isTrialing: false,
        trialEndsAt: null,
        currentPeriodEnd: null,
        plan: 'free'
      };
    }

    const now = new Date();
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
    const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;

    return {
      isActive: subscription.status === 'active',
      isTrialing: subscription.status === 'trialing' && trialEnd ? trialEnd > now : false,
      trialEndsAt: trialEnd,
      currentPeriodEnd: periodEnd,
      plan: subscription.plan_type
    };
  }

  // Create a subscription after trial
  async createSubscription(userId: string): Promise<void> {
    try {
      // Create subscription in Dodo Payments
      const subscription = await dodoClient.subscriptions.create({
        customer_id: userId,
        plan_id: import.meta.env.VITE_DODO_PREMIUM_PLAN_ID,
        trial_period_days: 0 // No additional trial
      });

      // Update subscription in Supabase
      const { error } = await supabase
        .from('subscriptions')
        .update({
          dodo_subscription_id: subscription.id,
          status: 'active',
          trial_end: null,
          current_period_end: new Date(subscription.current_period_end).toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('dodo_subscription_id')
        .eq('user_id', userId)
        .single();

      if (subscription?.dodo_subscription_id) {
        // Cancel in Dodo Payments
        await dodoClient.subscriptions.cancel(subscription.dodo_subscription_id);
      }

      // Update in Supabase
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService(); 