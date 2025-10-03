import nodemailer from 'nodemailer';

// Email template types
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Order confirmation template
export const orderConfirmationTemplate = (
  orderId: string,
  customerName: string,
  items: any[],
  total: number,
  shippingAddress: any
): EmailTemplate => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.product.title}</strong><br>
        <small>${item.variant.name} - ${item.qty}x</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${(item.variant.priceCents / 100).toFixed(2)}€
      </td>
    </tr>
  `).join('');

  return {
    subject: `Bestellbestätigung #${orderId} - Morgenstar`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bestellbestätigung</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 20px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total { font-size: 18px; font-weight: bold; color: #2c5530; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>☕ Morgenstar</h1>
            <h2>Bestellbestätigung</h2>
          </div>
          
          <div class="content">
            <p>Hallo ${customerName},</p>
            
            <p>vielen Dank für Ihre Bestellung! Hier sind die Details:</p>
            
            <h3>Bestellnummer: #${orderId}</h3>
            
            <table>
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Produkt</th>
                  <th style="padding: 10px; text-align: right;">Preis</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 10px; font-weight: bold;">Gesamt:</td>
                  <td style="padding: 10px; text-align: right;" class="total">
                    ${(total / 100).toFixed(2)}€
                  </td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Lieferadresse:</h3>
            <p>
              ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
              ${shippingAddress.street}<br>
              ${shippingAddress.zipCode} ${shippingAddress.city}<br>
              ${shippingAddress.country}
            </p>
            
            <p>Wir bearbeiten Ihre Bestellung so schnell wie möglich und senden Ihnen eine Versandbestätigung.</p>
            
            <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung!</p>
            
            <p>Mit freundlichen Grüßen<br>Ihr Morgenstar Team</p>
          </div>
          
          <div class="footer">
            <p>Morgenstar Kaffee | www.morgenstar.de | info@morgenstar.de</p>
            <p>Diese E-Mail wurde automatisch generiert.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Bestellbestätigung #${orderId} - Morgenstar
      
      Hallo ${customerName},
      
      vielen Dank für Ihre Bestellung!
      
      Bestellnummer: #${orderId}
      
      Produkte:
      ${items.map(item => `- ${item.product.title} (${item.variant.name}) - ${item.qty}x - ${(item.variant.priceCents / 100).toFixed(2)}€`).join('\n')}
      
      Gesamt: ${(total / 100).toFixed(2)}€
      
      Lieferadresse:
      ${shippingAddress.firstName} ${shippingAddress.lastName}
      ${shippingAddress.street}
      ${shippingAddress.zipCode} ${shippingAddress.city}
      ${shippingAddress.country}
      
      Mit freundlichen Grüßen
      Ihr Morgenstar Team
    `
  };
};

// Newsletter welcome template
export const newsletterWelcomeTemplate = (name: string): EmailTemplate => {
  return {
    subject: 'Willkommen bei unserem Newsletter! ☕',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Newsletter Willkommen</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { background: white; padding: 20px; margin: 20px 0; }
          .cta { background: #2c5530; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .cta a { color: white; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>☕ Morgenstar</h1>
            <h2>Willkommen bei unserem Newsletter!</h2>
          </div>
          
          <div class="content">
            <p>Hallo ${name || 'lieber Kaffeeliebhaber'},</p>
            
            <p>herzlich willkommen bei unserem Newsletter! 🎉</p>
            
            <p>Wir freuen uns, Sie über unsere neuesten Kaffeesorten, exklusive Angebote und spannende Kaffee-Geschichten informieren zu dürfen.</p>
            
            <div class="cta">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/kaffee">
                Entdecken Sie unsere Kaffeesorten
              </a>
            </div>
            
            <p>Was Sie von uns erwarten können:</p>
            <ul>
              <li>🆕 Neue Kaffeesorten und saisonale Angebote</li>
              <li>💰 Exklusive Rabatte nur für Newsletter-Abonnenten</li>
              <li>📖 Interessante Artikel über Kaffee und Röstkunst</li>
              <li>🎁 Überraschungen und Gewinnspiele</li>
            </ul>
            
            <p>Vielen Dank für Ihr Vertrauen!</p>
            
            <p>Mit kaffeefreundlichen Grüßen<br>Ihr Morgenstar Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Willkommen bei unserem Newsletter! ☕
      
      Hallo ${name || 'lieber Kaffeeliebhaber'},
      
      herzlich willkommen bei unserem Newsletter!
      
      Wir freuen uns, Sie über unsere neuesten Kaffeesorten, exklusive Angebote und spannende Kaffee-Geschichten informieren zu dürfen.
      
      Besuchen Sie unsere Website: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/kaffee
      
      Mit kaffeefreundlichen Grüßen
      Ihr Morgenstar Team
    `
  };
};

// Send email function
export const sendEmail = async (
  to: string,
  template: EmailTemplate,
  from: string = process.env.SMTP_FROM || 'Morgenstar <noreply@morgenstar.de>'
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
