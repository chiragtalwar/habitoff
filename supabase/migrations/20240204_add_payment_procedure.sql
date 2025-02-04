-- Drop existing functions to avoid overloading issues
DROP FUNCTION IF EXISTS public.process_payment(uuid, numeric, text, text, boolean, text);
DROP FUNCTION IF EXISTS public.process_payment(text, numeric, text, text, boolean, text);

-- Drop existing check constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Make current_period_end nullable
ALTER TABLE subscriptions ALTER COLUMN current_period_end DROP NOT NULL;

-- Add updated check constraint
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_type_check 
  CHECK (plan_type IN ('free', 'premium', 'lifetime'));

-- Create single process_payment function with correct types
CREATE OR REPLACE FUNCTION public.process_payment(
  p_user_id uuid,
  p_amount numeric,
  p_currency text,
  p_payment_id text,
  p_is_lifetime boolean,
  p_subscription_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id uuid;
  v_result jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert payment history
    INSERT INTO payment_history (
      user_id,
      amount,
      currency,
      payment_id,
      status,
      created_at
    ) VALUES (
      p_user_id,
      p_amount,
      p_currency,
      p_payment_id,
      'succeeded',
      NOW()
    );

    -- Check if subscription exists
    SELECT id INTO v_subscription_id 
    FROM subscriptions 
    WHERE user_id = p_user_id;

    IF v_subscription_id IS NOT NULL THEN
      -- Update existing subscription
      UPDATE subscriptions 
      SET 
        status = 'active',
        plan_type = CASE WHEN p_is_lifetime THEN 'lifetime' ELSE 'premium' END,
        dodo_payment_id = p_payment_id,
        dodo_subscription_id = p_subscription_id,
        current_period_end = CASE 
          WHEN p_is_lifetime THEN NULL
          ELSE NOW() + INTERVAL '1 month'
        END,
        next_billing_date = CASE 
          WHEN p_is_lifetime THEN NULL 
          ELSE NOW() + INTERVAL '1 month'
        END,
        trial_end = NULL,
        updated_at = NOW()
      WHERE id = v_subscription_id;
    ELSE
      -- Create new subscription
      INSERT INTO subscriptions (
        user_id,
        status,
        plan_type,
        dodo_payment_id,
        dodo_subscription_id,
        current_period_end,
        next_billing_date,
        trial_end,
        created_at,
        updated_at
      ) VALUES (
        p_user_id,
        'active',
        CASE WHEN p_is_lifetime THEN 'lifetime' ELSE 'premium' END,
        p_payment_id,
        p_subscription_id,
        CASE 
          WHEN p_is_lifetime THEN NULL
          ELSE NOW() + INTERVAL '1 month'
        END,
        CASE 
          WHEN p_is_lifetime THEN NULL 
          ELSE NOW() + INTERVAL '1 month'
        END,
        NULL,
        NOW(),
        NOW()
      );
    END IF;

    -- Prepare success result
    v_result := jsonb_build_object(
      'success', true,
      'payment_id', p_payment_id,
      'user_id', p_user_id,
      'is_lifetime', p_is_lifetime
    );

    RETURN v_result;
  EXCEPTION
    WHEN unique_violation THEN
      -- Payment already processed
      RETURN jsonb_build_object(
        'success', true,
        'payment_id', p_payment_id,
        'user_id', p_user_id,
        'is_lifetime', p_is_lifetime,
        'note', 'Payment was already processed'
      );
    WHEN OTHERS THEN
      -- Other errors
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
      );
  END;
END;
$$; 