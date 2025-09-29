import nodemailer from 'nodemailer';

// Email configuration with better error handling
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add connection timeout and retry logic
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
});

// Verify transporter configuration on startup
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email transporter verification failed:', error);
    } else {
      console.log('✅ Email server is ready to take our messages');
    }
  });
} else {
  console.log('⚠️ Email configuration missing - SMTP_USER and SMTP_PASS required');
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailData) {
  try {
    const info = await transporter.sendMail({
      from: `"Morgenstar" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

// Email templates
export function generateWelcomeEmail({ name, email }: { name: string; email: string }) {
  return {
    subject: 'Willkommen bei Morgenstar!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Willkommen bei Morgenstar</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">☕ Morgenstar</h1>
            <p style="color: #666; font-size: 16px;">Feiner Kaffee, schnelle Lieferung</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Willkommen, ${name}!</h2>
            <p style="margin-bottom: 15px;">
              Vielen Dank für Ihre Registrierung bei Morgenstar! Wir freuen uns, Sie in unserer Kaffeegemeinschaft begrüßen zu dürfen.
            </p>
            <p style="margin-bottom: 15px;">
              Mit Ihrem Konto können Sie:
            </p>
            <ul style="margin-bottom: 20px; padding-left: 20px;">
              <li>Ihre Bestellungen verfolgen</li>
              <li>Ihre Lieblingskaffees speichern</li>
              <li>Von exklusiven Angeboten profitieren</li>
              <li>Bewertungen abgeben</li>
            </ul>
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXTAUTH_URL}/kaffee" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Jetzt einkaufen
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
            <p>Ihr Morgenstar-Team</p>
          </div>
        </body>
      </html>
    `
  };
}

export function generateOrderConfirmationEmail({ 
  orderId, 
  customerName, 
  items, 
  total, 
  shippingAddress 
}: {
  orderId: string;
  customerName: string;
  items: Array<{
    title: string;
    variant: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    country: string;
  };
}) {
  const formatPrice = (priceCents: number) => (priceCents / 100).toFixed(2);
  
  return {
    subject: `Bestellbestätigung #${orderId.slice(-8)} - Morgenstar`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bestellbestätigung</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">☕ Morgenstar</h1>
            <p style="color: #666; font-size: 16px;">Feiner Kaffee, schnelle Lieferung</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #22c55e;">
            <h2 style="color: #166534; margin-bottom: 10px;">✅ Bestellung bestätigt!</h2>
            <p style="color: #166534; margin: 0;">
              Vielen Dank für Ihre Bestellung, ${customerName}! Ihre Bestellung wurde erfolgreich aufgegeben.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin-bottom: 20px;">Bestelldetails</h3>
            <p><strong>Bestellnummer:</strong> #${orderId.slice(-8)}</p>
            <p><strong>Bestelldatum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
            
            <h4 style="color: #374151; margin-top: 25px; margin-bottom: 15px;">Bestellte Artikel:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #d1d5db;">Produkt</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #d1d5db;">Menge</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #d1d5db;">Preis</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                      <strong>${item.title}</strong><br>
                      <small style="color: #6b7280;">${item.variant}</small>
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatPrice(item.price)} €</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background: #f9fafb;">
                  <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold;">Gesamt:</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #059669;">${formatPrice(total)} €</td>
                </tr>
              </tfoot>
            </table>
            
            <h4 style="color: #374151; margin-top: 25px; margin-bottom: 15px;">Lieferadresse:</h4>
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <p style="margin: 0;">
                ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
                ${shippingAddress.street} ${shippingAddress.houseNumber}<br>
                ${shippingAddress.postalCode} ${shippingAddress.city}<br>
                ${shippingAddress.country}
              </p>
            </div>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">Was passiert als nächstes?</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li>Wir bereiten Ihre Bestellung vor (1-2 Werktage)</li>
              <li>Sie erhalten eine Versandbestätigung mit Tracking-Informationen</li>
              <li>Ihre Bestellung wird innerhalb von 2-3 Werktagen geliefert</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/bestellungen" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
              Meine Bestellungen
            </a>
            <a href="${process.env.NEXTAUTH_URL}/kaffee" 
               style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Weiter einkaufen
            </a>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
            <p>Bei Fragen zu Ihrer Bestellung kontaktieren Sie uns gerne.</p>
            <p>Ihr Morgenstar-Team</p>
          </div>
        </body>
      </html>
    `
  };
}

export function generateOrderStatusUpdateEmail({
  orderId,
  customerName,
  status,
  trackingNumber
}: {
  orderId: string;
  customerName: string;
  status: string;
  trackingNumber?: string;
}) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bestätigt';
      case 'SHIPPED':
        return 'versendet';
      case 'DELIVERED':
        return 'geliefert';
      case 'CANCELLED':
        return 'storniert';
      default:
        return status.toLowerCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#2563eb';
      case 'SHIPPED':
        return '#7c3aed';
      case 'DELIVERED':
        return '#059669';
      case 'CANCELLED':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return {
    subject: `Bestellstatus Update #${orderId.slice(-8)} - Morgenstar`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bestellstatus Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">☕ Morgenstar</h1>
            <p style="color: #666; font-size: 16px;">Feiner Kaffee, schnelle Lieferung</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Bestellstatus Update</h2>
            <p style="margin-bottom: 15px;">Hallo ${customerName},</p>
            <p style="margin-bottom: 20px;">
              Ihre Bestellung <strong>#${orderId.slice(-8)}</strong> wurde 
              <span style="color: ${getStatusColor(status)}; font-weight: bold;">${getStatusText(status)}</span>.
            </p>
            
            ${trackingNumber ? `
              <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <h4 style="color: #1e40af; margin-bottom: 10px;">📦 Tracking-Informationen</h4>
                <p style="margin: 0; color: #1e40af;">
                  <strong>Tracking-Nummer:</strong> ${trackingNumber}
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXTAUTH_URL}/bestellungen" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Bestellung anzeigen
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>Ihr Morgenstar-Team</p>
          </div>
        </body>
      </html>
    `
  };
}

