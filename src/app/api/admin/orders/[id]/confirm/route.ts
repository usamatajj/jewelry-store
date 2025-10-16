import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendOrderConfirmedEmail } from '@/lib/email-supabase';

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

    // Check if order is in pending status
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: `Order is already ${order.status}. Can only confirm pending orders.` },
        { status: 400 }
      );
    }

    // Update order status to 'processing'
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Calculate estimated delivery (5 business days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    // Send order confirmed email
    const emailSent = await sendOrderConfirmedEmail({
      customerName: `${order.first_name} ${order.last_name}`,
      customerEmail: order.email,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      estimatedDelivery: estimatedDelivery.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      orderTrackingURL: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/orders`,
    });

    if (!emailSent) {
      console.error('Failed to send order confirmed email');
    }

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
      emailSent,
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
