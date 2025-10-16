import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing email configuration...');
    console.log('🧪 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('🧪 RESEND_API_KEY value:', process.env.RESEND_API_KEY);

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: 'RESEND_API_KEY is not set',
          help: 'Add RESEND_API_KEY to your .env.local file',
        },
        { status: 500 }
      );
    }

    // Test email sending
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eterna Jewels <onboarding@resend.dev>',
        to: 'delivered@resend.dev', // Resend's test email
        subject: '🧪 Test Email from Jewelry Store',
        html: '<h1>✅ Email is working!</h1><p>Your Resend API is configured correctly.</p>',
      }),
    });

    console.log('🧪 Response status:', response.status);
    const responseText = await response.text();
    console.log('🧪 Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to send email',
          status: response.status,
          details: responseText,
          apiKey: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
        },
        { status: 500 }
      );
    }

    const result = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      message: '✅ Email sent successfully!',
      emailId: result.id,
      note: 'Check the Resend dashboard to see the email',
    });
  } catch (error) {
    console.error('🧪 Test email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
