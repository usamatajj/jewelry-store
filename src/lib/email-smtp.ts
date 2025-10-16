// Email sending using SMTP (for Supabase or other SMTP providers)
import nodemailer from 'nodemailer';

interface OrderPlacedData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  shipping: string;
  codCharges?: string;
  total: string;
  shippingAddress: string;
  isBankTransfer: boolean;
  freeShipping: boolean;
}

interface OrderConfirmedData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  orderTrackingURL?: string;
}

interface PaymentVerifiedData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  totalAmount: string;
}

// Create SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate HTML email templates
function generateOrderPlacedEmail(data: OrderPlacedData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-size: 20px; font-weight: bold; color: #667eea; margin-top: 20px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Order Received!</h1>
            <p>Thank you for shopping with Eterna Jewels</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>We've received your order and will process it shortly. Here are your order details:</p>
            
            <div class="order-info">
              <h2>Order #${data.orderNumber}</h2>
              <p><strong>Date:</strong> ${data.orderDate}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              
              <h3>Items:</h3>
              ${data.items
                .map(
                  (item) => `
                <div class="item">
                  <strong>${item.name}</strong> × ${item.quantity}<br>
                  <span>${item.price}</span>
                </div>
              `
                )
                .join('')}
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                <p><strong>Subtotal:</strong> Rs ${data.subtotal}</p>
                <p><strong>Shipping:</strong> Rs ${data.shipping}</p>
                ${data.codCharges ? `<p><strong>COD Charges:</strong> Rs ${data.codCharges}</p>` : ''}
                <div class="total">
                  Total: Rs ${data.total}
                </div>
              </div>
            </div>
            
            ${
              data.isBankTransfer
                ? '<p><strong>Next Step:</strong> We will verify your payment within 24 hours and confirm your order.</p>'
                : '<p><strong>Next Step:</strong> Our team will call you to confirm your order. Please keep exact cash ready for delivery.</p>'
            }
          </div>
          
          <div class="footer">
            <p>Eterna Jewels - Timeless Elegance</p>
            <p>📧 eternajewels.store@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateOrderConfirmedEmail(data: OrderConfirmedData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
          </div>
          
          <div class="content">
            <div class="success-icon">✅</div>
            
            <p>Dear ${data.customerName},</p>
            <p>Great news! Your order has been confirmed and is now being prepared for shipment.</p>
            
            <div class="info-box">
              <h2>Order #${data.orderNumber}</h2>
              <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
              <p>Your order is being carefully prepared by our team. We will send you tracking information once it's shipped.</p>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>✅ Order confirmed</li>
              <li>📦 Being prepared for shipment</li>
              <li>🚚 Will be shipped soon</li>
              <li>📧 You will receive tracking info via email</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Eterna Jewels - Timeless Elegance</p>
            <p>📧 eternajewels.store@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generatePaymentVerifiedEmail(data: PaymentVerifiedData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .success-box { background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Verified!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            
            <div class="success-box">
              <h2>✓ Payment Confirmed</h2>
              <p style="font-size: 24px; margin: 10px 0;">Rs ${data.totalAmount}</p>
            </div>
            
            <div class="info-box">
              <p>We have successfully verified your payment for order <strong>#${data.orderNumber}</strong>.</p>
              <p>Your order will now be processed and prepared for shipment. You will receive a confirmation email once your order is ready to ship.</p>
            </div>
            
            <p>Thank you for choosing Eterna Jewels!</p>
          </div>
          
          <div class="footer">
            <p>Eterna Jewels - Timeless Elegance</p>
            <p>📧 eternajewels.store@gmail.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendOrderPlacedEmail(data: OrderPlacedData): Promise<boolean> {
  try {
    console.log('📧 Sending order placed email via SMTP...');
    console.log('📧 Recipient:', data.customerEmail);

    const transporter = createTransporter();
    const html = generateOrderPlacedEmail(data);

    await transporter.sendMail({
      from: `"Eterna Jewels" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Order Received - #${data.orderNumber}`,
      html,
    });

    console.log('✅ Order placed email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error sending order placed email:', error);
    return false;
  }
}

export async function sendOrderConfirmedEmail(
  data: OrderConfirmedData
): Promise<boolean> {
  try {
    console.log('📧 Sending order confirmed email via SMTP...');

    const transporter = createTransporter();
    const html = generateOrderConfirmedEmail(data);

    await transporter.sendMail({
      from: `"Eterna Jewels" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Order Confirmed - #${data.orderNumber}`,
      html,
    });

    console.log('✅ Order confirmed email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmed email:', error);
    return false;
  }
}

export async function sendPaymentVerifiedEmail(
  data: PaymentVerifiedData
): Promise<boolean> {
  try {
    console.log('📧 Sending payment verified email via SMTP...');

    const transporter = createTransporter();
    const html = generatePaymentVerifiedEmail(data);

    await transporter.sendMail({
      from: `"Eterna Jewels" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      subject: `Payment Verified - #${data.orderNumber}`,
      html,
    });

    console.log('✅ Payment verified email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error sending payment verified email:', error);
    return false;
  }
}
