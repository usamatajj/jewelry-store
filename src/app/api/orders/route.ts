import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendOrderConfirmationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const orderData = await request.json();

    const {
      user_id,
      email,
      first_name,
      last_name,
      address,
      city,
      state,
      zip_code,
      country,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_zip_code,
      delivery_country,
      total_amount,
      payment_method,
      items, // Array of cart items
    } = orderData;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null,
        email,
        first_name,
        last_name,
        address,
        city,
        state,
        zip_code,
        country,
        delivery_address: delivery_address || null,
        delivery_city: delivery_city || null,
        delivery_state: delivery_state || null,
        delivery_zip_code: delivery_zip_code || null,
        delivery_country: delivery_country || null,
        total_amount,
        payment_method,
        status: 'pending',
        payment_status: 'paid', // Assuming payment is successful
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // If order items fail, we should probably delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError.message },
        { status: 500 }
      );
    }

    // Get product details for email
    const productIds = items.map((item: any) => item.id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    // Prepare email data
    const emailItems = items.map((item: any) => {
      const product = products?.find((p) => p.id === item.id);
      return {
        name: product?.name || 'Unknown Product',
        price: item.price,
        quantity: item.quantity,
      };
    });

    // Calculate shipping and tax
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Prepare shipping address
    const shippingAddress = delivery_address
      ? `${delivery_address}, ${delivery_city}, ${delivery_state} ${delivery_zip_code}, ${delivery_country}`
      : `${address}, ${city}, ${state} ${zip_code}, ${country}`;

    // Calculate estimated delivery (7-10 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 10);
    const estimatedDeliveryStr = estimatedDelivery.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send confirmation email
    const emailResult = await sendOrderConfirmationEmail({
      customerName: `${first_name} ${last_name}`,
      email,
      orderNumber: order.id.slice(-8).toUpperCase(),
      orderDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      items: emailItems,
      subtotal,
      shippingCost: shipping,
      tax,
      total,
      shippingAddress,
      estimatedDelivery: estimatedDeliveryStr,
      orderTrackingURL: `${
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'
      }/orders/${order.id}`,
    });

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the order if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.id.slice(-8).toUpperCase(),
        emailSent: emailResult.success,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get orders for the user
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          quantity,
          price,
          products (
            name
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Transform the data to include items
    const transformedOrders =
      orders?.map((order) => ({
        ...order,
        items:
          order.order_items?.map((item: any) => ({
            product_name: item.products?.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price,
          })) || [],
      })) || [];

    return NextResponse.json({
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
