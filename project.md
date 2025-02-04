# Habito - Mindful Habits Garden Chrome Extension

## Project Overview
A Chrome extension that helps users build mindful habits through a gamified garden interface. Each habit is represented as a plant that grows with user's consistency.

## Architecture

### 1. Frontend (Chrome Extension)
- **Framework**: React + TypeScript + Vite
- **UI Libraries**: 
  - TailwindCSS for styling
  - Framer Motion for animations
  - ShadcnUI for components

### 2. Backend (Supabase)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Edge Functions**: Dodo Payments webhook handler

### 3. Payment Integration (Dodo Payments)
- **Products**:
  - Monthly Subscription (pdt_H4Plpv4la5wtdzU0XZTgk)
    - Price: $1/month
    - Features: Unlimited habits, all plant types, advanced analytics
  - Lifetime Access (pdt_gUut7yIhw8NffnEkF9cqW)
    - Price: $4.99 (80% off from $24.99)
    - Features: Everything in Premium + lifetime updates + priority support

## Database Schema

### 1. habits
- Primary table for storing user habits
- Columns:
  - id (uuid, PK)
  - user_id (uuid, FK to auth.users)
  - title (text)
  - description (text, nullable)
  - frequency ('daily', 'weekly', 'monthly')
  - plant_type ('flower', 'tree', 'succulent', 'herb')
  - streak (integer)
  - last_completed (timestamp)
  - created_at, updated_at

### 2. habit_completions
- Records of habit completion events
- Columns:
  - id (uuid, PK)
  - habit_id (uuid, FK to habits)
  - completed_date (timestamp)
  - created_at

### 3. profiles
- User profile information
- Columns:
  - id (uuid, PK, FK to auth.users)
  - email (text, unique)
  - full_name (text, nullable)
  - avatar_url (text, nullable)
  - created_at, updated_at

### 4. payment_history
- Payment transaction records
- Columns:
  - id (uuid, PK)
  - user_id (uuid, FK to auth.users)
  - subscription_id (uuid, FK to subscriptions)
  - amount (numeric)
  - currency (text)
  - status ('succeeded', 'failed', 'pending')
  - dodo_payment_id (text)
  - created_at

### 5. subscriptions
- User subscription status
- Columns:
  - id (uuid, PK)
  - user_id (uuid, FK to auth.users)
  - dodo_subscription_id (text)
  - status ('trialing', 'active', 'canceled', 'past_due')
  - plan_type ('free', 'premium', 'lifetime')
  - trial_end (timestamp)
  - current_period_end (timestamp)
  - created_at, updated_at

## Payment Flow

### 1. Monthly Subscription
1. User clicks "Start Monthly Plan"
2. Redirected to: `https://test.checkout.dodopayments.com/buy/pdt_H4Plpv4la5wtdzU0XZTgk?quantity=1`
3. After payment:
   - Webhook receives `payment.succeeded`
   - Creates payment record
   - Updates subscription to 'active'

### 2. Lifetime Access
1. User clicks "Get Lifetime Access"
2. Redirected to: `https://test.checkout.dodopayments.com/buy/pdt_gUut7yIhw8NffnEkF9cqW?quantity=1`
3. After payment:
   - Webhook receives `payment.succeeded`
   - Creates payment record
   - Sets subscription to 'lifetime'

## Webhook Handler (Edge Function)

### Events Handled:
1. `payment.succeeded`
   - Records payment
   - Updates subscription status
   - Handles both one-time and recurring payments

2. `payment.failed`
   - Records failed payment
   - Updates subscription status if needed

3. `subscription.active`/`subscription.renewed`
   - Updates subscription status to active
   - Updates billing dates

4. `subscription.on_hold`/`subscription.failed`
   - Updates subscription status accordingly

## Security

### 1. Database
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Service role used for webhook handler

### 2. Payments
- Webhook signatures verified
- Idempotency checks for payments
- Secure metadata handling

### 3. Authentication
- Supabase Auth for user management
- Secure session handling
- Protected API routes

## Project Structure
```
habitoff/
├── src/
│   ├── components/
│   │   └── subscription/
│   │       ├── UpgradeModal.tsx
│   │       └── PremiumStatusButton.tsx
│   ├── lib/
│   │   ├── webhookUtils.ts
│   │   └── dodoPayments.ts
│   ├── hooks/
│   │   └── useSubscription.ts
│   └── types/
│       └── subscription.ts
├── supabase/
│   └── functions/
│       └── dodo-webhook/
│           └── index.ts
└── database/
    └── migrations/
        └── 20240204_add_payment_procedure.sql
```
