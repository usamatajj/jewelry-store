# Database Schema Documentation

## Overview

This document provides a comprehensive overview of the jewelry store database schema, including table definitions, relationships, and indexes.

## Database: PostgreSQL (Supabase)

- **Host**: Supabase PostgreSQL
- **Extensions**: `uuid-ossp` for UUID generation
- **Security**: Row Level Security (RLS) enabled on all tables

## Table Definitions

### 1. `categories` Table

Hierarchical category structure for organizing jewelry products.

```sql
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

- `id` (UUID, Primary Key) - Unique identifier
- `name` (TEXT, NOT NULL) - Display name (e.g., "Women", "Necklaces")
- `slug` (TEXT, UNIQUE, NOT NULL) - URL-friendly identifier (e.g., "women", "necklaces")
- `parent_id` (UUID, Foreign Key) - References categories(id) for hierarchical structure
- `created_at` (TIMESTAMP) - Creation timestamp

**Relationships:**

- Self-referencing: `parent_id` → `categories(id)`
- One-to-many: One category can have many subcategories
- One-to-many: One category can have many products

### 2. `products` Table

Product catalog with detailed information.

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

**Columns:**

- `id` (UUID, Primary Key) - Unique identifier
- `name` (TEXT, NOT NULL) - Product name
- `slug` (TEXT, UNIQUE, NOT NULL) - URL-friendly identifier
- `description` (TEXT, NOT NULL) - Product description
- `price` (NUMERIC(10,2), NOT NULL) - Price with 2 decimal places
- `category_id` (UUID, NOT NULL, Foreign Key) - References categories(id)
- `image_url` (TEXT, NOT NULL) - Product image URL
- `created_at` (TIMESTAMP) - Creation timestamp

**Relationships:**

- Many-to-one: Many products belong to one category
- One-to-many: One product can appear in many order items

### 3. `users` Table

User profiles extending Supabase authentication.

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

- `id` (UUID, Primary Key) - References auth.users(id)
- `email` (TEXT, UNIQUE, NOT NULL) - User email address
- `role` (TEXT, DEFAULT 'customer') - User role: 'customer' or 'admin'
- `created_at` (TIMESTAMP) - Creation timestamp

**Relationships:**

- One-to-one: Extends Supabase auth.users
- One-to-many: One user can have many orders

### 4. `orders` Table

Order information and shipping details.

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

**Columns:**

- `id` (UUID, Primary Key) - Unique identifier
- `user_id` (UUID, Foreign Key) - References users(id), nullable for guest orders
- `email` (TEXT, NOT NULL) - Customer email
- `first_name`, `last_name` (TEXT, NOT NULL) - Customer name
- `address`, `city`, `state`, `zip_code`, `country` (TEXT, NOT NULL) - Billing address
- `delivery_address`, `delivery_city`, `delivery_state`, `delivery_zip_code`, `delivery_country` (TEXT) - Optional delivery address
- `total_amount` (NUMERIC(10,2), NOT NULL) - Order total
- `status` (TEXT, DEFAULT 'pending') - Order status
- `payment_method` (TEXT, NOT NULL) - Payment method used
- `payment_status` (TEXT, DEFAULT 'pending') - Payment status
- `created_at`, `updated_at` (TIMESTAMP) - Timestamps

**Relationships:**

- Many-to-one: Many orders belong to one user (nullable for guests)
- One-to-many: One order can have many order items

### 5. `order_items` Table

Individual items within orders.

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

**Columns:**

- `id` (UUID, Primary Key) - Unique identifier
- `order_id` (UUID, NOT NULL, Foreign Key) - References orders(id)
- `product_id` (UUID, NOT NULL, Foreign Key) - References products(id)
- `quantity` (INTEGER, NOT NULL) - Quantity ordered (must be > 0)
- `price` (NUMERIC(10,2), NOT NULL) - Price at time of order
- `created_at` (TIMESTAMP) - Creation timestamp

**Relationships:**

- Many-to-one: Many order items belong to one order
- Many-to-one: Many order items reference one product

## Indexes

Performance optimization indexes on frequently queried columns:

```sql
-- Categories indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Products indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price ON products(price);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

## Row Level Security (RLS)

### Policies

All tables have RLS enabled with appropriate policies:

#### Categories

```sql
-- Public read access
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);
```

#### Products

```sql
-- Public read access
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);
```

#### Users

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Orders

```sql
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Order Items

```sql
-- Users can view items from their orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Category Hierarchy

### Main Categories

1. **Women** (`women`)
2. **Men** (`men`)
3. **Couple** (`couple`)
4. **Gems** (`gems`)
5. **Personalized** (`personalized`)
6. **Gifting** (`gifting`)
7. **Our World** (`our-world`)

### Subcategories

#### Women's Subcategories

- Necklaces (`necklaces`)
- Earrings (`earrings`)
- Rings (`rings`)
- Bracelets (`bracelets`)
- Full Sets (`full-sets`)
- Engagement Rings (`engagement-rings`)
- Minimalist (`minimalist`)
- Solitaire Rings (`solitaire-rings`)
- Zodiac (`zodiac`)
- Anklets (`anklets`)
- Nose Pins (`nose-pins`)
- Best Sellers (`best-sellers`)
- New Arrivals (`new-arrivals`)

#### Men's Subcategories

- Bracelets (`bracelets`)
- Wallets (`wallets`)
- Rings (`rings`)
- Chains (`chains`)
- Cufflinks (`cufflinks`)
- Necklaces (`necklaces`)
- Lapel Pins (`lapel-pins`)

#### Couple's Subcategories

- Matching Sets (`matching-sets`)
- His & Hers (`his-hers`)
- Wedding Bands (`wedding-bands`)

#### Gems Subcategories

- Diamonds (`diamonds`)
- Gold (`gold`)
- Silver (`silver`)
- Pearls (`pearls`)
- Gemstones (`gemstones`)

#### Personalized Subcategories

- Engraved Jewelry (`engraved`)
- Custom Designs (`custom`)
- Birthstone Jewelry (`birthstone`)

#### Gifting Subcategories

- Gift Cards (`gift-cards`)
- Gift Sets (`gift-sets`)
- Special Occasions (`special-occasions`)

#### Our World Subcategories

- About Us (`about`)
- Sustainability (`sustainability`)
- Careers (`careers`)
- Contact (`contact`)

## Data Management

All data should be managed through the Supabase dashboard or the admin panel in the application. Use the admin panel to add, edit, and delete products and categories as needed.

## Functions and Triggers

### User Creation Function

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### User Creation Trigger

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Common Queries

### Get Products by Category

```sql
SELECT p.*, c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'necklaces' AND c.parent_id = (SELECT id FROM categories WHERE slug = 'women');
```

### Get Category Hierarchy

```sql
-- Get all subcategories for a main category
SELECT c.*
FROM categories c
WHERE c.parent_id = (SELECT id FROM categories WHERE slug = 'women');

-- Get main categories with their subcategories
SELECT
  parent.name as parent_name,
  parent.slug as parent_slug,
  child.name as child_name,
  child.slug as child_slug
FROM categories parent
LEFT JOIN categories child ON parent.id = child.parent_id
WHERE parent.parent_id IS NULL;
```

### Get User Orders

```sql
SELECT o.*,
       COUNT(oi.id) as item_count,
       SUM(oi.quantity * oi.price) as total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;
```

## Data Types

### UUID

- Used for all primary keys and foreign keys
- Generated using `uuid_generate_v4()`
- Ensures uniqueness and security

### NUMERIC(10,2)

- Used for prices and amounts
- 10 total digits, 2 decimal places
- Supports values up to 99,999,999.99

### TEXT

- Used for names, descriptions, addresses
- No length limit (PostgreSQL TEXT type)
- Supports Unicode characters

### TIMESTAMP WITH TIME ZONE

- Used for all timestamps
- Automatically handles timezone conversion
- Default value: `NOW()`

## Constraints

### Check Constraints

- `role` in users: Must be 'customer' or 'admin'
- `status` in orders: Must be valid status
- `payment_status` in orders: Must be valid payment status
- `quantity` in order_items: Must be greater than 0

### Foreign Key Constraints

- All foreign keys have proper references
- Cascade deletes where appropriate
- Set NULL for optional references

### Unique Constraints

- `slug` in categories: Must be unique
- `slug` in products: Must be unique
- `email` in users: Must be unique

## Performance Considerations

### Indexing Strategy

- Primary keys are automatically indexed
- Foreign keys are indexed for join performance
- Frequently queried columns (slug, price) are indexed
- Composite indexes where appropriate

### Query Optimization

- Use specific column selections
- Limit results with pagination
- Use proper WHERE clauses
- Leverage indexes effectively

### Data Volume

- UUIDs provide good distribution
- TEXT fields support large content
- NUMERIC fields are efficient for calculations
- Timestamps support high-frequency operations

## Security Features

### Row Level Security

- All tables have RLS enabled
- Policies control data access
- User-specific data isolation
- Admin override capabilities

### Data Validation

- Check constraints ensure data integrity
- Foreign key constraints maintain relationships
- Unique constraints prevent duplicates
- NOT NULL constraints ensure required data

### Access Control

- Public read access for products and categories
- User-specific access for orders and profiles
- Admin access for management operations
- Secure authentication through Supabase Auth
