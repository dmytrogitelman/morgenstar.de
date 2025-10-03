import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get all active coupons
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const { code, orderValue } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Ungültiger Gutscheincode' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Gutscheincode ist nicht mehr aktiv' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.validFrom > now || (coupon.validUntil && coupon.validUntil < now)) {
      return NextResponse.json({ error: 'Gutscheincode ist nicht mehr gültig' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Gutscheincode ist ausgeschöpft' }, { status: 400 });
    }

    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return NextResponse.json({ 
        error: `Mindestbestellwert von ${(coupon.minOrderValue / 100).toFixed(2)}€ nicht erreicht` 
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round((orderValue * coupon.value) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'FIXED') {
      discountAmount = coupon.value;
    }

    // Don't allow negative discount
    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
      },
      discountAmount,
      finalAmount: orderValue - discountAmount,
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
