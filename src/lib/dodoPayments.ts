import { supabase } from './supabase';

// Product IDs
const MONTHLY_PRODUCT_ID = 'pdt_H4Plpv4la5wtdzU0XZTgk';
const LIFETIME_PRODUCT_ID = 'pdt_gUut7yIhw8NffnEkF9cqW';
const DODO_API_URL = 'https://test.checkout.dodopayments.com';

interface CreateCheckoutOptions {
  userId: string;
  email: string;
  isLifetime?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

export const dodoPayments = {
  async createCheckoutSession({
    userId,
    email,
    isLifetime = false,
    successUrl = chrome.runtime.getURL('/index.html?payment=success'),
    cancelUrl = chrome.runtime.getURL('/index.html?payment=cancelled')
  }: CreateCheckoutOptions) {
    console.log('[DodoPayments] Creating checkout session', {
      userId,
      email,
      isLifetime,
      successUrl,
      cancelUrl
    });

    try {
      const productId = isLifetime ? LIFETIME_PRODUCT_ID : MONTHLY_PRODUCT_ID;
      
      // Different endpoints for subscription vs one-time payments
      const endpoint = isLifetime ? 'subscribe' : 'buy';
      let checkoutUrl = `${DODO_API_URL}/${endpoint}/${productId}?quantity=1`;
      
      // Add metadata
      const metadata = {
        userId,
        product_id: productId,
        isLifetime
      };
      
      // Add required parameters
      checkoutUrl += `&customer_email=${encodeURIComponent(email)}`;
      checkoutUrl += `&metadata=${encodeURIComponent(JSON.stringify(metadata))}`;
      
      // Add optional parameters
      if (successUrl) {
        checkoutUrl += `&success_url=${encodeURIComponent(successUrl)}`;
      }
      if (cancelUrl) {
        checkoutUrl += `&cancel_url=${encodeURIComponent(cancelUrl)}`;
      }
      
      console.log('[DodoPayments] Generated checkout URL:', checkoutUrl);
      
      return {
        url: checkoutUrl
      };
    } catch (error) {
      console.error('[DodoPayments] Error creating checkout session:', error);
      throw error;
    }
  },

  async getSubscriptionStatus(userId: string) {
    console.log('[DodoPayments] Fetching subscription status', { userId });

    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no subscription found, return a default free status instead of null
        if (error.code === 'PGRST116') {
          return {
            id: userId,
            user_id: userId,
            status: 'free',
            plan_type: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        console.error('[DodoPayments] Error fetching subscription:', error);
        return null;
      }

      console.log('[DodoPayments] Subscription status fetched', {
        userId,
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          plan_type: subscription.plan_type
        } : null
      });

      return subscription;
    } catch (error) {
      console.error('[DodoPayments] Error in getSubscriptionStatus:', error);
      throw error;
    }
  },

  async updateSubscriptionStatus(userId: string, status: string) {
    console.log('[DodoPayments] Updating subscription status', { userId, status });

    try {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status,
          plan_type: status === 'active' ? 'premium' : 'free',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[DodoPayments] Error updating subscription:', error);
        throw error;
      }

      console.log('[DodoPayments] Subscription status updated successfully', {
        userId,
        status
      });
    } catch (error) {
      console.error('[DodoPayments] Error in updateSubscriptionStatus:', error);
      throw error;
    }
  }
}; 