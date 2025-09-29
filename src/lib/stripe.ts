import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Test Stripe connection
export async function testStripeConnection() {
  try {
    const balance = await stripe.balance.retrieve();
    console.log('✅ Stripe connection successful');
    return { success: true, balance };
  } catch (error) {
    console.error('❌ Stripe connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Client-side Stripe instance
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    const { loadStripe } = require('@stripe/stripe-js');
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return null;
};

export interface PaymentIntentData {
  amount: number; // in cents
  currency: string;
  metadata: {
    orderId: string;
    userId: string;
  };
}

export async function createPaymentIntent(data: PaymentIntentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment creation failed',
    };
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Stripe payment intent retrieval failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment retrieval failed',
    };
  }
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Stripe payment intent confirmation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment confirmation failed',
    };
  }
}

