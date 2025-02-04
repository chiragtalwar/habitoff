export type SubscriptionStatus = 'trialing' | 'active' | 'inactive';
export type PlanType = 'free' | 'premium' | 'lifetime';

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan_type: PlanType;
  trial_end: string | null;
  current_period_end: string | null;
  dodo_subscription_id?: string;
  created_at: string;
  updated_at: string;
} 