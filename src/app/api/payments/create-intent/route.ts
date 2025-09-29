import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPaymentIntent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const { amount, currency = 'eur', orderId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Ungültiger Betrag' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Bestell-ID ist erforderlich' },
        { status: 400 }
      );
    }

    const result = await createPaymentIntent({
      amount: Math.round(amount), // Ensure amount is in cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        userId: session.user.id,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Fehler bei der Zahlungserstellung' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Zahlungserstellung' },
      { status: 500 }
    );
  }
}


