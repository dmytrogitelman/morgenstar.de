import { NextRequest, NextResponse } from 'next/server';
import { stripe, testStripeConnection } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    // Test Stripe connection
    const connectionTest = await testStripeConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Stripe connection failed',
        details: connectionTest.error,
      }, { status: 500 });
    }

    // Test creating a payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 100, // 1€ in cents
        currency: 'eur',
        metadata: { test: 'true' },
      });

      // Cancel the test payment intent immediately
      await stripe.paymentIntents.cancel(paymentIntent.id);

      return NextResponse.json({
        success: true,
        message: 'Stripe integration working correctly',
        tests: {
          connection: '✅ Connected',
          paymentIntent: '✅ Created and cancelled',
          apiKey: process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing',
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Missing',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing',
        },
        balance: connectionTest.balance,
      });

    } catch (paymentError) {
      return NextResponse.json({
        success: false,
        error: 'Payment intent creation failed',
        details: paymentError instanceof Error ? paymentError.message : 'Unknown error',
        tests: {
          connection: '✅ Connected',
          paymentIntent: '❌ Failed',
          apiKey: process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing',
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Missing',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing',
        },
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Stripe test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      tests: {
        connection: '❌ Failed',
        paymentIntent: '❌ Not tested',
        apiKey: process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing',
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Missing',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing',
      },
    }, { status: 500 });
  }
}

