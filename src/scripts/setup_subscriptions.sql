-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    dodo_subscription_id text,
    status text NOT NULL CHECK (status IN ('trialing', 'active', 'canceled', 'past_due')),
    plan_type text NOT NULL CHECK (plan_type IN ('free', 'premium')),
    trial_end timestamp with time zone,
    current_period_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id uuid REFERENCES subscriptions(id),
    amount numeric NOT NULL,
    currency text NOT NULL,
    status text NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending')),
    dodo_payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
    ON public.payment_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON public.payment_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add subscription_type to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_type'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN subscription_type text NOT NULL DEFAULT 'free';
    END IF;
END $$; 