import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail, generateOrderStatusUpdateEmail } from '@/lib/email';

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    const { status, trackingNumber } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status ist erforderlich' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      );
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        status,
        ...(trackingNumber && { trackingNumber })
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

    // Send status update email
    try {
      if (order.user) {
        const emailData = generateOrderStatusUpdateEmail({
          orderId: order.id,
          customerName: order.user.name || order.user.email,
          status: order.status,
          trackingNumber: trackingNumber || undefined
        });

        await sendEmail({
          to: order.user.email,
          subject: emailData.subject,
          html: emailData.html
        });
      }
    } catch (emailError) {
      console.error('Status update email failed:', emailError);
      // Don't fail status update if email fails
    }

    return NextResponse.json({
      message: 'Bestellstatus erfolgreich aktualisiert',
      order
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Bestellstatus' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        user: true,
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

    if (!order) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bestellung' },
      { status: 500 }
    );
  }
}


