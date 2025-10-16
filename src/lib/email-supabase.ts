// Email sending via Supabase Edge Function
// This calls the Edge Function you created in Supabase portal

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

// Helper to call Supabase Edge Function
async function callEdgeFunction(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    // The name of your Edge Function in Supabase portal
    const functionName = 'resend-email'; // ✅ Matches the deployed function name
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

    console.log(`📧 Calling Edge Function: ${edgeFunctionUrl}`);
    console.log(`📧 Sending to: ${to}`);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ to, subject, html }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Edge Function error:', result);
      return false;
    }

    console.log('✅ Email sent via Edge Function!');
    return true;
  } catch (error) {
    console.error('❌ Error calling Edge Function:', error);
    return false;
  }
}

// Generate HTML templates
function generateOrderPlacedHTML(data: OrderPlacedData): string {
  const itemsRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
    </tr>
  `
    )
    .join('');

  const nextStep = data.isBankTransfer
    ? '<p>We will verify your payment within 24 hours and confirm your order.</p>'
    : '<p>Our team will call you to confirm your order. Please keep exact cash ready for delivery.</p>';

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
    .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8f9fa; padding: 10px; text-align: left; }
    .total { font-size: 20px; font-weight: bold; color: #667eea; margin-top: 20px; }
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
      <p>We've received your order and will process it shortly.</p>
      
      <div class="order-info">
        <h2>Order #${data.orderNumber}</h2>
        <p><strong>Date:</strong> ${data.orderDate}</p>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        
        <h3>Items:</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
          <p><strong>Subtotal:</strong> Rs ${data.subtotal}</p>
          <p><strong>Shipping:</strong> Rs ${data.shipping}</p>
          ${data.codCharges ? `<p><strong>COD Charges:</strong> Rs ${data.codCharges}</p>` : ''}
          <div class="total">Total: Rs ${data.total}</div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 6px;">
          <h3>📍 Delivery Address</h3>
          <p>${data.shippingAddress}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff9e6; border-radius: 6px;">
          <h3>🔔 Next Steps</h3>
          ${nextStep}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Eterna Jewels - Timeless Elegance</p>
      <p>📧 support@eternajewels.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateOrderConfirmedHTML(data: OrderConfirmedData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed!</h1>
    </div>
    
    <div class="content">
      <p>Dear ${data.customerName},</p>
      <p>Great news! Your order <strong>#${data.orderNumber}</strong> has been confirmed and is now being prepared for shipment.</p>
      
      <div class="info-box">
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        <p>Your order is being carefully prepared. You'll receive tracking information once it ships.</p>
      </div>
      
      <h3>What's Next?</h3>
      <ul>
        <li>✅ Order confirmed</li>
        <li>📦 Being prepared for shipment</li>
        <li>🚚 Will be shipped soon</li>
        <li>📧 You will receive tracking info</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>Eterna Jewels - Timeless Elegance</p>
      <p>📧 support@eternajewels.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePaymentVerifiedHTML(data: PaymentVerifiedData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
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
      <p>📧 support@eternajewels.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Export functions
export async function sendOrderPlacedEmail(data: OrderPlacedData): Promise<boolean> {
  const subject = `Order Received - #${data.orderNumber}`;
  const html = generateOrderPlacedHTML(data);
  return callEdgeFunction(data.customerEmail, subject, html);
}

export async function sendOrderConfirmedEmail(
  data: OrderConfirmedData
): Promise<boolean> {
  const subject = `Order Confirmed - #${data.orderNumber}`;
  const html = generateOrderConfirmedHTML(data);
  return callEdgeFunction(data.customerEmail, subject, html);
}

export async function sendPaymentVerifiedEmail(
  data: PaymentVerifiedData
): Promise<boolean> {
  const subject = `Payment Verified - #${data.orderNumber}`;
  const html = generatePaymentVerifiedHTML(data);
  return callEdgeFunction(data.customerEmail, subject, html);
}
