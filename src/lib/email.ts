import fs from 'fs';
import path from 'path';

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

// Helper function to load and compile email template
function loadTemplate(templateName: string, data: Record<string, unknown>): string {
  const templatePath = path.join(
    process.cwd(),
    'templates',
    'email',
    `${templateName}.html`
  );
  let template = fs.readFileSync(templatePath, 'utf-8');

  // Simple template replacement (you can use a library like Handlebars for more complex cases)
  Object.keys(data).forEach((key) => {
    const value = data[key];

    // Handle arrays for items
    if (key === 'items' && Array.isArray(value)) {
      let itemsHtml = '';
      value.forEach((item: { name: string; quantity: number; price: string }) => {
        itemsHtml += `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td style="text-align: right;">${item.price}</td>
          </tr>
        `;
      });
      template = template.replace('{{#each items}}', '').replace('{{/each}}', '');
      template = template.replace(
        /<tbody>[\s\S]*?<\/tbody>/,
        `<tbody>${itemsHtml}</tbody>`
      );
    }

    // Handle conditionals
    if (key === 'isBankTransfer') {
      if (value) {
        template = template.replace(/{{#if isBankTransfer}}[\s\S]*?{{\/if}}/g, (match) =>
          match.replace(/{{#if isBankTransfer}}|{{\/if}}/g, '')
        );
        template = template.replace(/{{else}}[\s\S]*?(?={{\/if}})/g, '');
      } else {
        template = template.replace(/{{#if isBankTransfer}}[\s\S]*?{{else}}/g, '');
      }
    }

    if (key === 'freeShipping') {
      if (value) {
        template = template.replace(
          /{{#if freeShipping}}Free{{else}}[\s\S]*?{{\/if}}/g,
          'Free'
        );
      } else {
        template = template.replace(/{{#if freeShipping}}Free{{else}}/g, '');
        template = template.replace(/{{\/if}}/g, '');
      }
    }

    if (key === 'codCharges') {
      if (value) {
        template = template.replace(/{{#if codCharges}}[\s\S]*?{{\/if}}/g, (match) =>
          match.replace(/{{#if codCharges}}|{{\/if}}/g, '')
        );
      } else {
        template = template.replace(/{{#if codCharges}}[\s\S]*?{{\/if}}/g, '');
      }
    }

    if (key === 'trackingNumber') {
      if (value) {
        template = template.replace(/{{#if trackingNumber}}[\s\S]*?{{\/if}}/g, (match) =>
          match.replace(/{{#if trackingNumber}}|{{\/if}}/g, '')
        );
      } else {
        template = template.replace(/{{#if trackingNumber}}[\s\S]*?{{\/if}}/g, '');
      }
    }

    if (key === 'orderTrackingURL') {
      if (value) {
        template = template.replace(
          /{{#if orderTrackingURL}}[\s\S]*?{{\/if}}/g,
          (match) => match.replace(/{{#if orderTrackingURL}}|{{\/if}}/g, '')
        );
      } else {
        template = template.replace(/{{#if orderTrackingURL}}[\s\S]*?{{\/if}}/g, '');
      }
    }

    // Simple variable replacement
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, String(value || ''));
  });

  return template;
}

export async function sendOrderPlacedEmail(data: OrderPlacedData): Promise<boolean> {
  try {
    console.log('📧 Attempting to send order placed email...');
    console.log('📧 Recipient:', data.customerEmail);
    console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log(
      '📧 RESEND_API_KEY preview:',
      process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    );

    const html = loadTemplate('order-placed', data as Record<string, unknown>);

    // For testing: Override recipient email if not using verified domain
    // TODO: Remove this once domain is verified
    const testEmail = process.env.RESEND_TEST_EMAIL || 'eternajewels.store@gmail.com';
    const recipientEmail =
      process.env.NODE_ENV === 'production' ? data.customerEmail : testEmail;

    console.log('📧 Sending to:', recipientEmail, '(original:', data.customerEmail, ')');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eterna Jewels <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `Order Received - #${data.orderNumber}`,
        html,
      }),
    });

    console.log('📧 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to send order placed email:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ Email sent successfully!', result);
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
    const html = loadTemplate('order-confirmed', data as Record<string, unknown>);

    // For testing: Override recipient email if not using verified domain
    const testEmail = process.env.RESEND_TEST_EMAIL || 'eternajewels.store@gmail.com';
    const recipientEmail =
      process.env.NODE_ENV === 'production' ? data.customerEmail : testEmail;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eterna Jewels <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `Order Confirmed - #${data.orderNumber}`,
        html,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send order confirmed email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending order confirmed email:', error);
    return false;
  }
}

export async function sendPaymentVerifiedEmail(
  data: PaymentVerifiedData
): Promise<boolean> {
  try {
    const html = loadTemplate('payment-verified', data as Record<string, unknown>);

    // For testing: Override recipient email if not using verified domain
    const testEmail = process.env.RESEND_TEST_EMAIL || 'eternajewels.store@gmail.com';
    const recipientEmail =
      process.env.NODE_ENV === 'production' ? data.customerEmail : testEmail;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eterna Jewels <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `Payment Verified - #${data.orderNumber}`,
        html,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send payment verified email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending payment verified email:', error);
    return false;
  }
}
