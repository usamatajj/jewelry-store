// Supabase Edge Function to send emails via Resend
// This runs on Supabase's servers, not in your Next.js app

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, to, data } = await req.json();

    // Get Resend API key from Supabase environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set in Supabase secrets');
    }

    console.log(`📧 Sending ${type} email to: ${to}`);

    // Generate email content based on type
    let subject = '';
    let html = '';

    if (type === 'order-placed') {
      subject = `Order Confirmation - #${data.orderNumber}`;
      html = generateOrderPlacedEmail(data);
    } else if (type === 'order-confirmed') {
      subject = `Order Confirmed - #${data.orderNumber}`;
      html = generateOrderConfirmedEmail(data);
    } else if (type === 'payment-verified') {
      subject = `Payment Verified - #${data.orderNumber}`;
      html = generatePaymentVerifiedEmail(data);
    } else {
      throw new Error(`Unknown email type: ${type}`);
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Eterna Jewels <onboarding@resend.dev>',
        to: [to], // Sends to actual customer email!
        subject: subject,
        html: html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', resendData);
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`);
    }

    console.log('✅ Email sent successfully:', resendData);

    return new Response(JSON.stringify({ success: true, data: resendData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Email template generators
function generateOrderPlacedEmail(data: any): string {
  const itemsHtml = data.items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs ${item.price.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs ${item.total.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  const nextStepHtml =
    data.paymentMethod === 'Bank Transfer'
      ? `<p style="color: #666; line-height: 1.6;">We've received your bank transfer screenshot and our team will verify your payment within 24 hours. You'll receive a confirmation email once verified.</p>`
      : `<p style="color: #666; line-height: 1.6;">Your order will be prepared for delivery. Our team may contact you at <strong>${data.phone}</strong> to confirm delivery details or request a small advance to ensure smooth delivery.</p>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="color: white; margin: 0; font-size: 32px;">✨ Thank You for Your Order!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi <strong>${data.customerName}</strong>,</p>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">Your order has been successfully placed! We're excited to prepare your items for delivery.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Order Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Order Number:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">#${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Order Date:</td>
                    <td style="padding: 8px 0; text-align: right; color: #333;">${data.orderDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                    <td style="padding: 8px 0; text-align: right; color: #333;">${data.paymentMethod === 'Bank Transfer' ? '🏦 Bank Transfer' : '💰 Cash on Delivery'}</td>
                  </tr>
                </table>
              </div>

              <h3 style="color: #333; margin: 30px 0 20px 0;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                    <td style="padding: 8px 0; text-align: right; color: #333;">Rs ${data.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Shipping:</td>
                    <td style="padding: 8px 0; text-align: right; color: #333;">Rs ${data.shipping.toLocaleString()}</td>
                  </tr>
                  ${
                    data.codCharges > 0
                      ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">COD Charges (4.5%):</td>
                    <td style="padding: 8px 0; text-align: right; color: #333;">Rs ${data.codCharges.toLocaleString()}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #333;">Total:</td>
                    <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">Rs ${data.total.toLocaleString()}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #e7f3ff; padding: 20px; border-radius: 6px; border-left: 4px solid #2196F3; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1976D2; font-size: 18px;">📍 Delivery Address</h3>
                <p style="margin: 0; color: #555; line-height: 1.6;">${data.deliveryAddress}</p>
              </div>

              <div style="background-color: #fff9e6; padding: 20px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #f57c00; font-size: 18px;">🔔 Next Steps</h3>
                ${nextStepHtml}
              </div>

              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #999; font-size: 14px;">Need help? Contact us at <a href="mailto:support@eternajewels.com" style="color: #667eea; text-decoration: none;">support@eternajewels.com</a></p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 0;">© 2025 Eterna Jewels. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateOrderConfirmedEmail(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
        <h1 style="color: white; margin: 0; font-size: 32px;">✅ Your Order is Confirmed!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; line-height: 1.6;">Great news! Your order <strong>#${data.orderNumber}</strong> has been confirmed and is now being processed.</p>
              
              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 6px; border-left: 4px solid #4caf50; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 18px;">📦 Order Status</h3>
                <p style="margin: 0; color: #555; line-height: 1.6;">Your order is being prepared for shipment. We'll notify you once it's on its way!</p>
              </div>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Estimated Delivery:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${data.estimatedDelivery || '3-5 Business Days'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Tracking Available:</td>
                    <td style="padding: 8px 0; text-align: right; color: #333;">Once shipped</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #999; font-size: 14px;">Questions? Contact us at <a href="mailto:support@eternajewels.com" style="color: #11998e; text-decoration: none;">support@eternajewels.com</a></p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 0;">© 2025 Eterna Jewels. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generatePaymentVerifiedEmail(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verified</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);">
        <h1 style="color: white; margin: 0; font-size: 32px;">💳 Payment Verified!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333; line-height: 1.6;">Good news! Your payment for order <strong>#${data.orderNumber}</strong> has been verified.</p>
              
              <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; border-left: 4px solid #2196F3; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1565C0; font-size: 18px;">✅ Payment Confirmed</h3>
                <p style="margin: 0; color: #555; line-height: 1.6;">We've successfully verified your bank transfer. Your order is now being processed!</p>
              </div>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Order Number:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">#${data.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Payment Status:</td>
                    <td style="padding: 8px 0; text-align: right; color: #4caf50; font-weight: bold;">✓ Verified</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">Rs ${data.totalAmount?.toLocaleString() || 'N/A'}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fff9e6; padding: 20px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #f57c00; font-size: 18px;">📦 What's Next?</h3>
                <p style="margin: 0; color: #666; line-height: 1.6;">Your order is being prepared for shipment. You'll receive a tracking number once it's dispatched!</p>
              </div>

              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #999; font-size: 14px;">Need help? Contact us at <a href="mailto:support@eternajewels.com" style="color: #2196F3; text-decoration: none;">support@eternajewels.com</a></p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 0;">© 2025 Eterna Jewels. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

