import { createClient } from '@/lib/supabase-server';

interface OrderConfirmationData {
  customerName: string;
  email: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: string;
  estimatedDelivery: string;
  orderTrackingURL: string;
}

export async function sendOrderConfirmationEmail(orderData: OrderConfirmationData) {
  try {
    const supabase = await createClient();

    // Create the HTML content for the email
    const htmlContent = createOrderConfirmationHTML(orderData);

    // Use Supabase Edge Functions or a service like Resend, SendGrid, etc.
    // For now, we'll use Supabase's built-in email functionality if available
    // or you can integrate with services like Resend, SendGrid, etc.

    // Example using a hypothetical email service
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Luxe Jewelry <orders@luxejewelry.com>',
        to: [orderData.email],
        subject: `Order Confirmation #${orderData.orderNumber} - Luxe Jewelry`,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error(`Email service error: ${emailResponse.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function createOrderConfirmationHTML(data: OrderConfirmationData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <div class="order-item">
      <span class="item-name">${item.name} (Qty: ${item.quantity})</span>
      <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation - Luxe Jewelry</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fafafa;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #d4af37;
            margin-bottom: 10px;
          }
          .tagline {
            font-style: italic;
            color: #666;
            font-size: 14px;
          }
          .content {
            margin-bottom: 30px;
          }
          .order-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .order-item:last-child {
            border-bottom: none;
          }
          .item-name {
            font-weight: bold;
            color: #2c3e50;
          }
          .item-price {
            color: #d4af37;
            font-weight: bold;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #d4af37;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #d4af37, #b8941f);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .shipping-info {
            background: #e8f4fd;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #0c5460;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
          .social-links {
            margin: 15px 0;
          }
          .social-links a {
            color: #d4af37;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💎 Luxe Jewelry</div>
            <div class="tagline">Exquisite Jewelry for Every Moment</div>
          </div>

          <div class="content">
            <h1>Order Confirmation</h1>

            <p>Dear ${data.customerName},</p>

            <p>
              Thank you for your order! We're excited to prepare your beautiful
              jewelry pieces with the utmost care and attention to detail.
            </p>

            <div class="order-summary">
              <h3>Order #${data.orderNumber}</h3>
              <p><strong>Order Date:</strong> ${data.orderDate}</p>

              ${itemsHTML}
              <div class="order-item">
                <span>Subtotal:</span>
                <span>$${data.subtotal.toFixed(2)}</span>
              </div>
              <div class="order-item">
                <span>Shipping:</span>
                <span>${
                  data.shippingCost === 0 ? 'Free' : `$${data.shippingCost.toFixed(2)}`
                }</span>
              </div>
              <div class="order-item">
                <span>Tax:</span>
                <span>$${data.tax.toFixed(2)}</span>
              </div>
              <div class="total">
                <span>Total: $${data.total.toFixed(2)}</span>
              </div>
            </div>

            <div class="shipping-info">
              <h3>🚚 Shipping Information</h3>
              <p>
                <strong>Ship to:</strong><br />
                ${data.shippingAddress}
              </p>
              <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
            </div>

            <p>
              We'll send you a tracking number once your order ships. In the
              meantime, feel free to contact us if you have any questions about your
              order.
            </p>

            <div style="text-align: center">
              <a href="${data.orderTrackingURL}" class="cta-button"
                >Track Your Order</a
              >
            </div>

            <p>Thank you for choosing Luxe Jewelry!</p>

            <p>
              Best regards,<br />
              <strong>The Luxe Jewelry Team</strong>
            </p>
          </div>

          <div class="footer">
            <div class="social-links">
              <a href="#">Instagram</a> | <a href="#">Facebook</a> |
              <a href="#">Pinterest</a>
            </div>
            <p>
              Luxe Jewelry Store<br />
              123 Diamond Lane, Jewel City, JC 12345<br />
              Phone: (555) 123-JEWEL | Email: hello@luxejewelry.com
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
