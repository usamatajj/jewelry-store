# Jewelry Store - API Reference

## Supabase Database Schema

### Tables Overview

```sql
-- Core tables in the jewelry store database
categories    # Product categories with hierarchy
products      # Product catalog
users         # Extended user profiles
orders        # Order information
order_items   # Order line items
```

### Categories Table

```sql
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- Self-referencing: `parent_id` → `categories.id`
- One-to-many: `categories` → `products`

**Key Fields**:

- `id`: Unique identifier
- `name`: Display name (e.g., "Women", "Necklaces")
- `slug`: URL-friendly identifier (e.g., "women", "necklaces")
- `parent_id`: Parent category for subcategories (NULL for top-level)

### Products Table

```sql
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- Many-to-one: `products` → `categories`
- One-to-many: `products` → `order_items`

**Key Fields**:

- `id`: Unique identifier
- `name`: Product name
- `slug`: URL-friendly identifier
- `description`: Product description
- `price`: Price in USD (decimal)
- `category_id`: Foreign key to categories
- `image_url`: Product image URL

### Users Table

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- One-to-one: `users` → `auth.users` (Supabase Auth)
- One-to-many: `users` → `orders`

**Key Fields**:

- `id`: References Supabase auth.users.id
- `email`: User email address
- `role`: Access level ('customer' or 'admin')

### Orders Table

```sql
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip_code TEXT,
  delivery_country TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- Many-to-one: `orders` → `users`
- One-to-many: `orders` → `order_items`

### Order Items Table

```sql
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**:

- Many-to-one: `order_items` → `orders`
- Many-to-one: `order_items` → `products`

## TypeScript Interfaces

### Core Types

```typescript
// src/types/index.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  created_at: string;
  category?: Category;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
  bankName?: string;
}
```

## Supabase Client Configuration

### Server-Side Client

```typescript
// src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context
          }
        },
      },
    }
  );
}
```

### Client-Side Client

```typescript
// src/lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Common Database Queries

### Fetch Products with Categories

```typescript
const { data: products, error } = await supabase
  .from('products')
  .select(
    `
    *,
    category:categories(*)
  `
  )
  .order('created_at', { ascending: false });
```

### Fetch Categories with Hierarchy

```typescript
// Get top-level categories
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .is('parent_id', null)
  .order('name');

// Get subcategories for a specific parent
const { data: subcategories } = await supabase
  .from('categories')
  .select('*')
  .eq('parent_id', parentId)
  .order('name');
```

### Search Products

```typescript
const { data: products } = await supabase
  .from('products')
  .select(
    `
    *,
    category:categories(*)
  `
  )
  .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  .order('created_at', { ascending: false });
```

### Filter Products by Category

```typescript
const { data: products } = await supabase
  .from('products')
  .select(
    `
    *,
    category:categories(*)
  `
  )
  .eq('category.slug', categorySlug)
  .order('created_at', { ascending: false });
```

## Authentication API

### Sign Up

```typescript
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign In

```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Get User Profile

```typescript
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

## Row Level Security (RLS) Policies

### Categories - Public Read Access

```sql
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);
```

### Products - Public Read Access

```sql
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);
```

### Users - Own Profile Access

```sql
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Users - Admin Access

```sql
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Orders - Own Orders Access

```sql
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

### Orders - Admin Access

```sql
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Environment Variables

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Environment Setup

1. Create Supabase project
2. Get project URL and API keys from Supabase dashboard
3. Create `.env.local` file with environment variables
4. Run database schema from `supabase-schema.sql`

## Error Handling Patterns

### Database Error Handling

```typescript
const { data, error } = await supabase.from('products').select('*');

if (error) {
  console.error('Database error:', error);
  // Handle error appropriately
  return [];
}

return data;
```

### Authentication Error Handling

```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  setError(error.message);
  return;
}

// Success handling
```

### Form Validation Error Handling

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});

// Display errors in UI
{
  errors.email && (
    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
  );
}
```

## Performance Optimization

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### Query Optimization

- Use `select()` to limit returned fields
- Use `order()` for consistent sorting
- Use `limit()` for pagination
- Use `eq()`, `gte()`, `lte()` for efficient filtering

### Caching Strategies

- Server-side rendering for static content
- Client-side caching for frequently accessed data
- Image optimization with Next.js Image component
- CDN for static assets
