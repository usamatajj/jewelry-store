import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendPaymentVerifiedEmail } from '@/lib/email-supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user (admin check)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if payment is pending
    if (order.payment_status !== 'pending') {
      return NextResponse.json(
        {
          error: `Payment status is already ${order.payment_status}. Can only verify pending payments.`,
        },
        { status: 400 }
      );
    }

    // Check if this is a bank transfer order
    if (order.payment_method !== 'bank_transfer') {
      return NextResponse.json(
        { error: 'Payment verification is only for bank transfer orders' },
        { status: 400 }
      );
    }

    // Update payment status to 'paid'
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Send payment verified email
    const emailSent = await sendPaymentVerifiedEmail({
      customerName: `${order.first_name} ${order.last_name}`,
      customerEmail: order.email,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      totalAmount: `${Number(order.total_amount).toLocaleString('en-PK')}`,
    });

    if (!emailSent) {
      console.error('Failed to send payment verified email');
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      emailSent,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
