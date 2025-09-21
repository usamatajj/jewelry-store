# Quick Reference - Most Used Queries

## 🏠 Homepage & Navigation

### Get Main Categories for Navigation

```sql
SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name;
```

### Get Subcategories for Dropdown

```sql
SELECT * FROM categories
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'women')
ORDER BY name;
```

## 🛍️ Product Pages

### Get All Products (Homepage)

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC
LIMIT 12;
```

### Get Products by Category

```sql
SELECT
  p.*,
  c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'necklaces'
ORDER BY p.created_at DESC;
```

### Get Single Product

```sql
SELECT
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.slug = 'classic-gold-necklace';
```

### Search Products

```sql
SELECT
  p.*,
  c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.name ILIKE '%search_term%'
   OR p.description ILIKE '%search_term%';
```

## 🛒 Cart & Checkout

### Create Order

```sql
INSERT INTO orders (
  user_id, email, first_name, last_name,
  address, city, state, zip_code, country,
  total_amount, payment_method
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING *;
```

### Add Order Items

```sql
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES ($1, $2, $3, $4);
```

## 👤 User Management

### Get User Profile

```sql
SELECT * FROM users WHERE id = $1;
```

### Get User Orders

```sql
SELECT
  o.*,
  json_agg(
    json_build_object(
      'product_name', p.name,
      'quantity', oi.quantity,
      'price', oi.price
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;
```

## 🔧 Admin Panel

### Get All Products (Admin)

```sql
SELECT
  p.*,
  c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;
```

### Get All Orders (Admin)

```sql
SELECT
  o.*,
  u.email as user_email
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;
```

### Get Sales Stats

```sql
SELECT
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE status != 'cancelled';
```

## 📱 TypeScript Examples

### Fetch Products

```typescript
const { data: products, error } = await supabase
  .from('products')
  .select(
    `
    *,
    categories!inner(name, slug)
  `
  )
  .eq('categories.slug', 'necklaces')
  .order('created_at', { ascending: false });
```

### Create Order

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    email: email,
    first_name: firstName,
    last_name: lastName,
    address: address,
    city: city,
    state: state,
    zip_code: zipCode,
    country: country,
    total_amount: totalAmount,
    payment_method: paymentMethod,
  })
  .select()
  .single();
```

### Search Products

```typescript
const { data: products, error } = await supabase
  .from('products')
  .select(
    `
    *,
    categories!inner(name, slug)
  `
  )
  .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  .order('created_at', { ascending: false });
```

## 🎯 Filter Examples

### By Price Range

```typescript
const { data: products } = await supabase
  .from('products')
  .select('*')
  .gte('price', minPrice)
  .lte('price', maxPrice)
  .order('price', { ascending: true });
```

### By Category

```typescript
const { data: products } = await supabase
  .from('products')
  .select(
    `
    *,
    categories!inner(name, slug)
  `
  )
  .eq('categories.slug', categorySlug);
```

### Sort Options

```typescript
// Price Low to High
.order('price', { ascending: true })

// Price High to Low
.order('price', { ascending: false })

// Newest First
.order('created_at', { ascending: false })

// Name A-Z
.order('name', { ascending: true })
```

These are the most commonly used queries for your jewelry store! 🎉
