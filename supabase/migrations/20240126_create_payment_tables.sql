-- Create subscriptions table
create table if not exists public.subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    dodo_subscription_id text,
    status text check (status in ('free', 'trialing', 'active', 'expired', 'canceled')) not null default 'free',
    plan_type text check (plan_type in ('free', 'premium')) not null default 'free',
    trial_end timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payment_history table
create table if not exists public.payment_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    amount numeric not null,
    currency text not null,
    status text check (status in ('succeeded', 'failed', 'pending')) not null,
    dodo_payment_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;
alter table public.payment_history enable row level security;

-- Policies for subscriptions
create policy "Users can view own subscription"
    on public.subscriptions for select
    using (auth.uid() = user_id);

create policy "Service role can manage all subscriptions"
    on public.subscriptions for all
    using (auth.role() = 'service_role');

-- Policies for payment_history
create policy "Users can view own payment history"
    on public.payment_history for select
    using (auth.uid() = user_id);

create policy "Service role can manage all payment history"
    on public.payment_history for all
    using (auth.role() = 'service_role'); 