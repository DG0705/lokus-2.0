import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function sendEmailOtp(email: string, code: string) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your LOKUS login OTP",
    html: `<p>Your OTP is <b>${code}</b>. It expires in 5 minutes.</p>`,
  });
}

export async function sendMobileOtp(mobile: string, code: string) {
  console.info(`Mobile OTP for ${mobile}: ${code}`);
}

// Order confirmation email
export async function sendOrderConfirmationEmail(
  userEmail: string,
  userName: string,
  orderId: string,
  items: Array<{ name: string; size: number; color: string; qty: number; unitPrice: number }>,
  totalAmount: number,
  shippingFee: number
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const orderSuccessUrl = `${baseUrl}/checkout/success/${orderId}`;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div>
          <strong>${item.name}</strong><br>
          <small style="color: #6b7280;">Size: ${item.size} | Color: ${item.color}</small>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.qty}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        â¹${item.unitPrice.toLocaleString('en-IN')}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
        â¹${(item.unitPrice * item.qty).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - LOKUS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 20px; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #B58B6B 0%, #8B6B47 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .order-id { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-family: monospace; font-size: 18px; font-weight: 600; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
        .total-row { font-weight: 600; font-size: 16px; }
        .cta-button { display: inline-block; background: #B58B6B; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; text-align: center; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Order!</h1>
          <p>We've received your order and are preparing it for shipment.</p>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Your order has been successfully placed. Here are the details:</p>
          
          <div class="order-id">
            Order ID: ${orderId.slice(-8).toUpperCase()}
          </div>
          
          <h3>Order Summary</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;">Subtotal:</td>
                <td style="padding: 12px; text-align: right;">â¹${(totalAmount - shippingFee).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                <td style="padding: 12px; text-align: right;">â¹${shippingFee.toLocaleString('en-IN')}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;">Total Amount:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;">â¹${totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="text-align: center;">
            <a href="${orderSuccessUrl}" class="cta-button">View Order Details</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            You'll receive another email when your order ships with tracking information.
          </p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing LOKUS!</p>
          <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: userEmail,
    subject: `Order Confirmation - LOKUS (${orderId.slice(-8).toUpperCase()})`,
    html,
  });
}

// Shipping notification email
export async function sendShippingNotificationEmail(
  userEmail: string,
  userName: string,
  orderId: string,
  trackingNumber: string,
  courierPartner: string
) {
  const trackingUrl = `https://lokus.com/track?id=${trackingNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Shipped - LOKUS</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 20px; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .tracking-info { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .tracking-number { font-family: monospace; font-size: 20px; font-weight: 600; color: #10b981; margin: 10px 0; }
        .cta-button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; text-align: center; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Good News! Your Order Has Shipped</h1>
          <p>Your items are on their way to you</p>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          <p>We're happy to let you know that your order has been shipped and is on its way!</p>
          
          <h3>Tracking Information</h3>
          <div class="tracking-info">
            <p style="margin: 0; font-weight: 600;">Order ID: ${orderId.slice(-8).toUpperCase()}</p>
            <p style="margin: 5px 0;">Courier: ${courierPartner}</p>
            <div class="tracking-number">${trackingNumber}</div>
            <a href="${trackingUrl}" class="cta-button">Track Your Package</a>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Your order should arrive within 5-7 business days</li>
            <li>You can track your package using the link above</li>
            <li>Please ensure someone is available to receive the delivery</li>
          </ul>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            If you have any questions about your order, please don't hesitate to contact our support team.
          </p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing LOKUS!</p>
          <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: userEmail,
    subject: `Your Order Has Shipped! - LOKUS (${orderId.slice(-8).toUpperCase()})`,
    html,
  });
}
