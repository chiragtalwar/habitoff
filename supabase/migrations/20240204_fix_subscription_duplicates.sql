-- First, handle duplicate subscriptions by keeping the active one or the most recent one
WITH ranked_subscriptions AS (
  SELECT 
    id,
    user_id,
    status,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY 
        -- Prefer active subscriptions
        CASE WHEN status = 'active' THEN 0
             WHEN status = 'trialing' THEN 1
             ELSE 2 
        END,
        -- Then prefer newer subscriptions
        created_at DESC
    ) as rn
  FROM public.subscriptions
)
DELETE FROM public.subscriptions
WHERE id IN (
  SELECT id 
  FROM ranked_subscriptions 
  WHERE rn > 1
);

-- Now add unique constraint on user_id
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id); 