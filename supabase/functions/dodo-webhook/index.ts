import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const DODO_WEBHOOK_SECRET = Deno.env.get('DODO_PAYMENTS_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!DODO_WEBHOOK_SECRET) {
  throw new Error('DODO_WEBHOOK_SECRET is required')
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function verifyDodoSignature(request: Request): Promise<boolean> { 
  const webhookId = request.headers.get('webhook-id')
  const signature = request.headers.get('webhook-signature')
  const timestamp = request.headers.get('webhook-timestamp')

  if (!webhookId || !signature || !timestamp) {
    console.error('Missing webhook headers:', {
      webhookId: !!webhookId,
      signature: !!signature,
      timestamp: !!timestamp
    })
    return false
  }

  try {
    // Log headers for debugging
    console.log('Webhook headers:', {
      webhookId,
      signature,
      timestamp
    })

    return true // Temporarily return true for testing
  } catch (err) {
    console.error('Error verifying signature:', err)
    return false
  }
}

async function handlePaymentSucceeded(event: any) {
  try {
    const payment = event.data;
    const customer = payment.customer;
    
    // Skip if this is a subscription-related payment
    if (payment.subscription_id) {
      console.log('Skipping subscription payment, will be handled by subscription webhook:', {
        payment_id: payment.payment_id,
        subscription_id: payment.subscription_id
      });
      return;
    }
    
    // Check if this payment was already processed
    const { data: existingPayment } = await supabase
      .from('payment_history')
      .select('id, dodo_payment_id')
      .eq('dodo_payment_id', payment.payment_id)
      .single();

    if (existingPayment) {
      console.log('Payment already processed:', {
        payment_id: payment.payment_id,
        existing_id: existingPayment.id
      });
      return;
    }
    
    // Parse metadata - it comes as a JSON string
    let metadata;
    try {
      metadata = typeof payment.metadata === 'string' 
        ? JSON.parse(payment.metadata) 
        : payment.metadata || {};
    } catch (err) {
      console.error('Error parsing metadata:', err);
      metadata = {};
    }

    // Get user ID either from metadata or lookup by email
    let userId = metadata.userId;
    if (!userId && customer?.email) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer.email)
        .single();

      if (!userError && userData) {
        userId = userData.id;
      }
    }

    if (!userId) {
      console.error('Could not determine userId:', { metadata, customer });
      throw new Error('Could not determine userId');
    }

    // Determine if this is a lifetime purchase from the product cart
    const isLifetime = payment.product_cart?.some(
      (item: any) => item.product_id === 'pdt_gUut7yIhw8NffnEkF9cqW'
    );

    console.log('Processing one-time payment:', {
      userId,
      payment_id: payment.payment_id,
      is_lifetime: isLifetime,
      amount: payment.total_amount,
      currency: payment.currency
    });

    // Start a transaction for atomic updates
    const { data: result, error: processError } = await supabase.rpc('process_payment', {
      p_user_id: userId,
      p_amount: payment.total_amount,
      p_currency: payment.currency || 'USD',
      p_payment_id: payment.payment_id,
      p_is_lifetime: isLifetime,
      p_subscription_id: null // One-time payments don't have subscription IDs
    });

    if (processError) {
      console.error('Error in payment transaction:', processError);
      throw processError;
    }

    if (!result.success) {
      console.error('Payment processing failed:', result.error);
      throw new Error(result.error);
    }

    console.log('Successfully processed one-time payment:', {
      userId,
      payment_id: payment.payment_id,
      is_lifetime: isLifetime,
      result
    });

    return result;
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(event: any) {
  console.log('Processing payment.failed event:', event)
  
  try {
    const userId = event.metadata?.userId
    const payment = event.data?.payment

    if (!userId || !payment) {
      console.error('Missing required payment data:', { userId, payment })
      return
    }

    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        status: 'failed',
        dodo_payment_id: payment.id,
        created_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('Error creating payment history:', paymentError)
      throw paymentError
    }

    console.log('Failed payment recorded successfully')
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error)
    throw error
  }
}

async function handleSubscriptionEvent(event: any) {
  const subscription = event.data;
  const customer = subscription.customer;

  if (!customer || !subscription) {
    console.error('Missing required subscription data');
    return;
  }

  // Get user_id from profiles
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customer.email)
    .single();

  if (userError || !userData) {
    console.error('Error finding user:', userError);
    throw userError;
  }

  const userId = userData.id;

  // Handle different subscription events
  switch (event.type) {
    case 'subscription.active':
    case 'subscription.renewed':
      // Use process_payment RPC for subscription events
      const { data: result, error: processError } = await supabase.rpc('process_payment', {
        p_user_id: userId,
        p_amount: subscription.amount || 0,
        p_currency: subscription.currency || 'USD',
        p_payment_id: subscription.payment_id || `sub_${subscription.subscription_id}`,
        p_is_lifetime: false, // Monthly subscriptions are never lifetime
        p_subscription_id: subscription.subscription_id
      });

      if (processError) {
        console.error('Error processing subscription payment:', processError);
        throw processError;
      }

      if (!result.success) {
        console.error('Subscription processing failed:', result.error);
        throw new Error(result.error);
      }

      console.log('Successfully processed subscription:', {
        userId,
        subscription_id: subscription.subscription_id,
        result
      });
      break;

    case 'subscription.on_hold':
    case 'subscription.failed':
      // For these events, we can directly update the status
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: event.type === 'subscription.on_hold' ? 'on_hold' : 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating subscription status:', updateError);
        throw updateError;
      }
      break;
  }
}

serve(async (req: Request) => {
  try {
    const body = await req.text()
    console.log('Received webhook event:', {
      body,
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(req.headers.entries())
    })
    
    // Verify Dodo webhook signature
    if (!await verifyDodoSignature(req)) {
      console.error('Invalid webhook signature:', {
        headers: Object.fromEntries(req.headers.entries()),
        timestamp: new Date().toISOString()
      })
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Processing event:', {
      type: event.type,
      event_id: event.id,
      timestamp: new Date().toISOString()
    })

    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event)
        break
      case 'payment.failed':
        await handlePaymentFailed(event)
        break
      case 'subscription.active':
      case 'subscription.renewed':
      case 'subscription.on_hold':
      case 'subscription.failed':
        await handleSubscriptionEvent(event)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}) 