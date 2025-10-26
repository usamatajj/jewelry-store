import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendOrderPlacedEmail } from '@/lib/email-supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const orderData = await request.json();

    const {
      user_id,
      email,
      first_name,
      last_name,
      phone,
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
      payment_screenshot,
      items, // Array of cart items
    } = orderData;

    // Determine payment status based on payment method
    const payment_status = payment_method === 'bank_transfer' ? 'pending' : 'pending';

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null,
        email,
        first_name,
        last_name,
        phone,
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
        payment_screenshot: payment_screenshot || null,
        status: 'pending',
        payment_status,
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
    const orderItems = items.map(
      (item: { id: string; product_name: string; quantity: number; price: number }) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.product_name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
      })
    );

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

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
    const productIds = items.map((item: { id: string }) => item.id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    // Prepare email data
    const emailItems = items.map(
      (item: { id: string; price: number; quantity: number }) => {
        const product = products?.find((p) => p.id === item.id);
        return {
          name: product?.name || 'Unknown Product',
          price: item.price,
          quantity: item.quantity,
        };
      }
    );

    // Calculate shipping and tax
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Shipping logic: Free above Rs 5000 for bank transfer, always Rs 200 for COD
    const shipping =
      payment_method === 'cash_on_delivery'
        ? 200 // COD always pays shipping
        : subtotal >= 5000
          ? 0 // Bank transfer gets free shipping above Rs 5000
          : 200;

    const total = subtotal + shipping;

    // Prepare shipping address
    const shippingAddress = delivery_address
      ? `${delivery_address}, ${delivery_city}, ${delivery_state} ${delivery_zip_code}, ${delivery_country}`
      : `${address}, ${city}, ${state} ${zip_code}, ${country}`;

    // Calculate estimated delivery (7-10 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 10);

    // Send order placed email
    console.log('📧 Order created successfully, now sending email...');
    console.log('📧 Email will be sent to:', email);

    const emailSent = await sendOrderPlacedEmail({
      customerName: `${first_name} ${last_name}`,
      customerEmail: email,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      orderDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      paymentMethod:
        payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery',
      items: emailItems.map(
        (item: { name: string; price: number; quantity: number }) => ({
          name: item.name,
          quantity: item.quantity,
          price: `Rs ${item.price.toLocaleString('en-PK')}`,
        })
      ),
      subtotal: `${subtotal.toLocaleString('en-PK')}`,
      shipping: `${shipping.toLocaleString('en-PK')}`,
      total: `${total.toLocaleString('en-PK')}`,
      shippingAddress,
      isBankTransfer: payment_method === 'bank_transfer',
      freeShipping: shipping === 0,
    });

    console.log('📧 Email send result:', emailSent ? '✅ Success' : '❌ Failed');

    if (!emailSent) {
      console.error('❌ Failed to send order placed email');
      // Don't fail the order if email fails, just log it
    } else {
      console.log('✅ Order email sent successfully!');
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.id.slice(0, 8).toUpperCase(),
        emailSent,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform the data to include items
    const transformedOrders =
      orders?.map((order) => ({
        ...order,
        items:
          order.order_items?.map(
            (item: {
              products?: { name?: string };
              quantity: number;
              price: number;
            }) => ({
              product_name: item.products?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
            })
          ) || [],
      })) || [];

    return NextResponse.json({
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
