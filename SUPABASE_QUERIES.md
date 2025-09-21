# Supabase Queries Guide for Jewelry Store

## 📋 Database Schema

The complete schema is already set up in `supabase-schema.sql`. Here's a summary of the tables:

### Tables Structure

- **categories** - Product categories and subcategories
- **products** - Product information
- **users** - User profiles (extends Supabase auth)
- **orders** - Customer orders
- **order_items** - Individual items in orders

## 🔍 Essential Queries

### 1. Categories Queries

#### Get All Main Categories

```sql
SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name;
```

#### Get Subcategories for a Main Category

```sql
SELECT * FROM categories
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'women')
ORDER BY name;
```

#### Get Category with Subcategories (Hierarchical)

```sql
SELECT
  c1.*,
  json_agg(c2.*) as subcategories
FROM categories c1
LEFT JOIN categories c2 ON c1.id = c2.parent_id
WHERE c1.parent_id IS NULL
GROUP BY c1.id, c1.name, c1.slug, c1.parent_id, c1.created_at
ORDER BY c1.name;
```

### 2. Products Queries

#### Get All Products with Category Info

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  parent_c.name as parent_category_name
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN categories parent_c ON c.parent_id = parent_c.id
ORDER BY p.created_at DESC;
```

#### Get Products by Category

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'necklaces'
ORDER BY p.created_at DESC;
```

#### Get Products by Parent Category (e.g., all Women's products)

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.parent_id = (SELECT id FROM categories WHERE slug = 'women')
ORDER BY p.created_at DESC;
```

#### Search Products by Name or Description

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.name ILIKE '%necklace%'
   OR p.description ILIKE '%necklace%'
ORDER BY p.created_at DESC;
```

#### Filter Products by Price Range

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price BETWEEN 100 AND 500
ORDER BY p.price ASC;
```

#### Sort Products (Price, Name, Date)

```sql
-- By Price (Low to High)
SELECT * FROM products ORDER BY price ASC;

-- By Price (High to Low)
SELECT * FROM products ORDER BY price DESC;

-- By Name (A to Z)
SELECT * FROM products ORDER BY name ASC;

-- By Date (Newest First)
SELECT * FROM products ORDER BY created_at DESC;
```

#### Get Single Product by Slug

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  parent_c.name as parent_category_name
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN categories parent_c ON c.parent_id = parent_c.id
WHERE p.slug = 'classic-gold-necklace';
```

#### Get Related Products (Same Category)

```sql
SELECT * FROM products
WHERE category_id = (
  SELECT category_id FROM products WHERE slug = 'classic-gold-necklace'
)
AND slug != 'classic-gold-necklace'
LIMIT 4;
```

### 3. User Queries

#### Get User Profile

```sql
SELECT * FROM users WHERE id = $1;
```

#### Update User Role (Admin only)

```sql
UPDATE users
SET role = 'admin'
WHERE id = $1;
```

#### Get All Users (Admin only)

```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### 4. Order Queries

#### Create New Order

```sql
INSERT INTO orders (
  user_id, email, first_name, last_name,
  address, city, state, zip_code, country,
  delivery_address, delivery_city, delivery_state,
  delivery_zip_code, delivery_country,
  total_amount, payment_method
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9,
  $10, $11, $12, $13, $14, $15, $16
) RETURNING *;
```

#### Add Items to Order

```sql
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES ($1, $2, $3, $4);
```

#### Get User's Orders

```sql
SELECT
  o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'product_name', p.name,
      'product_image', p.image_url
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;
```

#### Get Order Details

```sql
SELECT
  o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'product_name', p.name,
      'product_image', p.image_url,
      'product_slug', p.slug
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.id = $1
GROUP BY o.id;
```

#### Update Order Status

```sql
UPDATE orders
SET status = $2, updated_at = NOW()
WHERE id = $1;
```

#### Get All Orders (Admin)

```sql
SELECT
  o.*,
  u.email as user_email,
  json_agg(
    json_build_object(
      'id', oi.id,
      'product_id', oi.product_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'product_name', p.name
    )
  ) as items
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY o.id, u.email
ORDER BY o.created_at DESC;
```

### 5. Analytics Queries

#### Get Sales Summary

```sql
SELECT
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_order_value
FROM orders
WHERE status != 'cancelled';
```

#### Get Top Selling Products

```sql
SELECT
  p.name,
  p.slug,
  p.image_url,
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY p.id, p.name, p.slug, p.image_url
ORDER BY total_sold DESC
LIMIT 10;
```

#### Get Orders by Status

```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_amount
FROM orders
GROUP BY status
ORDER BY count DESC;
```

## 🚀 Next.js API Integration Examples

### 1. Get Products with Filtering

```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  let query = supabase.from('products').select(`
      *,
      categories!inner(name, slug, parent_id)
    `);

  if (category) {
    query = query.eq('categories.slug', category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (minPrice) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice) {
    query = query.lte('price', maxPrice);
  }

  query = query.order(sort, { ascending: order === 'asc' });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### 2. Create Order

```typescript
// app/api/orders/route.ts
export async function POST(request: Request) {
  const orderData = await request.json();
  const { items, ...orderInfo } = orderData;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderInfo)
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Add order items
  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ order });
}
```

## 🔐 Row Level Security (RLS) Policies

The schema includes comprehensive RLS policies:

- **Categories & Products**: Public read access
- **Users**: Users can view their own data, admins can view all
- **Orders**: Users can view their own orders, admins can view all
- **Order Items**: Users can view items from their orders, admins can view all

## 📊 Sample Data

The schema includes sample categories and products to get you started:

- **7 Main Categories**: Women, Men, Couple, Gems, Personalized, Gifting, Our World
- **Subcategories**: Detailed subcategories for each main category
- **Sample Products**: 10 sample products across different categories

## 🛠️ Setup Instructions

1. **Run the schema**: Execute `supabase-schema.sql` in your Supabase SQL editor
2. **Configure RLS**: The policies are already included in the schema
3. **Set up Storage**: Create a bucket for product images
4. **Configure Auth**: Set up authentication providers in Supabase dashboard

## 🔧 Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

This comprehensive guide covers all the queries you'll need for your jewelry store! 🎉
