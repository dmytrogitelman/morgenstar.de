import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { sendEmail, generateOrderStatusUpdateEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Keine Stripe-Signatur' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Ungültige Signatur' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook-Fehler' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    const { orderId, userId } = paymentIntent.metadata;

    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    // Update order status to confirmed
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'CONFIRMED',
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'PAID'
      },
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    // Send confirmation email
    if (order.user) {
      try {
        const emailData = generateOrderStatusUpdateEmail({
          orderId: order.id,
          customerName: order.user.name || order.user.email,
          status: 'CONFIRMED'
        });

        await sendEmail({
          to: order.user.email,
          subject: emailData.subject,
          html: emailData.html
        });
      } catch (emailError) {
        console.error('Payment confirmation email failed:', emailError);
      }
    }

    console.log(`Payment succeeded for order ${orderId}`);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    const { orderId } = paymentIntent.metadata;

    if (!orderId) {
      console.error('No orderId in payment intent metadata');
      return;
    }

    // Update order status to cancelled
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'CANCELLED',
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'FAILED'
      }
    });

    console.log(`Payment failed for order ${orderId}`);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}


