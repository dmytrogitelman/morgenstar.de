import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate test email
    const emailData = generateWelcomeEmail({
      name: 'Test User',
      email: email,
    });

    // Send test email
    await sendEmail({
      to: email,
      subject: 'Morgenstar - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #92400e;">☕ Morgenstar Kaffee</h1>
          <h2>Email-System Test</h2>
          <p>Hallo Test User,</p>
          <p>Dies ist eine Test-E-Mail vom Morgenstar-System. Das Email-System funktioniert korrekt!</p>
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">✅ Email-Funktionen aktiv:</h3>
            <ul>
              <li>Bestellbestätigungen</li>
              <li>Willkommens-E-Mails</li>
              <li>Bestellstatus-Updates</li>
              <li>Versandbenachrichtigungen</li>
            </ul>
          </div>
          <p>Mit freundlichen Grüßen,<br>Ihr Morgenstar Team</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht darauf.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'Test email sent successfully',
      email: email,
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

