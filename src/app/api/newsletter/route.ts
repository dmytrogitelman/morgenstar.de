import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-Mail-Adresse ist erforderlich' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ 
          error: 'Diese E-Mail-Adresse ist bereits für den Newsletter angemeldet' 
        }, { status: 400 });
      } else {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { id: existing.id },
          data: { 
            isActive: true,
            name: name || existing.name,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Newsletter-Anmeldung wurde reaktiviert' 
        });
      }
    }

    // Create new subscription
    await prisma.newsletter.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Erfolgreich für den Newsletter angemeldet!' 
    });

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ error: 'Fehler bei der Newsletter-Anmeldung' }, { status: 500 });
  }
}

// GET - Get all newsletter subscribers (admin only)
export async function GET() {
  try {
    // TODO: Add admin authentication check
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
