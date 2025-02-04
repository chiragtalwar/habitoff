-- Add dodo_payment_id column to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS dodo_payment_id text,
ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
ADD COLUMN IF NOT EXISTS next_billing_date timestamptz,
ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
ADD COLUMN IF NOT EXISTS trial_end timestamptz;

-- Add unique constraint to prevent duplicate payments
ALTER TABLE payment_history
ADD CONSTRAINT unique_dodo_payment_id UNIQUE (dodo_payment_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_history_dodo_payment_id ON payment_history(dodo_payment_id);

-- Add index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Function to handle subscription updates
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update subscription status when payment is recorded
    UPDATE subscriptions
    SET 
        status = 'active',
        trial_end = NULL,
        dodo_payment_id = NEW.dodo_payment_id,
        updated_at = NOW()
    WHERE user_id = NEW.user_id::uuid;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update subscription on payment
DROP TRIGGER IF EXISTS update_subscription_on_payment ON payment_history;
CREATE TRIGGER update_subscription_on_payment
    AFTER INSERT ON payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_status(); 