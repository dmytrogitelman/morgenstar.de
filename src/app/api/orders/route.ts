import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail, generateOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const { items, shippingAddress, billingAddress, paymentMethod, total } = await request.json();

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Warenkorb ist leer' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: 'Adressdaten fehlen' },
        { status: 400 }
      );
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        totalCents: total,
        currency: 'EUR',
        items: {
          create: items.map((item: any) => ({
            variantId: item.variant.id,
            qty: item.qty,
            priceCents: item.variant.priceCents
          }))
        }
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    brand: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Update product stock
    for (const item of items) {
      await prisma.productVariant.update({
        where: { id: item.variant.id },
        data: {
          inStock: {
            decrement: item.qty
          }
        }
      });
    }

    // Send order confirmation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (user) {
        const emailData = generateOrderConfirmationEmail({
          orderId: order.id,
          customerName: user.name || user.email,
          items: items.map((item: any) => ({
            title: item.variant.product.title,
            variant: item.variant.name,
            quantity: item.qty,
            price: item.variant.priceCents * item.qty
          })),
          total: total,
          shippingAddress: shippingAddress
        });

        await sendEmail({
          to: user.email,
          subject: emailData.subject,
          html: emailData.html
        });
      }
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
      // Don't fail order creation if email fails
    }

    // TODO: Process payment based on paymentMethod
    // TODO: Clear user's cart

    return NextResponse.json({
      orderId: order.id,
      message: 'Bestellung erfolgreich erstellt'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Bestellerstellung' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    brand: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellungen' },
      { status: 500 }
    );
  }
}
