# Database Relationships

## 📊 Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ id (PK)         │◄─────────┐
│ email           │          │
│ role            │          │
│ created_at      │          │
└─────────────────┘          │
                             │
                             │ user_id (FK, nullable)
                             │ One user can have many orders
                             │
┌─────────────────┐          │
│    ORDERS       │          │
│─────────────────│          │
│ id (PK)         │──────────┘
│ user_id (FK)    │──────────┐
│ email           │          │
│ first_name      │          │
│ last_name       │          │
│ phone           │          │
│ address         │          │
│ city            │          │
│ total_amount    │          │
│ status          │          │
│ payment_method  │          │
│ payment_status  │          │
│ payment_screenshot│        │
│ created_at      │          │
└─────────────────┘          │
                             │
                             │ order_id (FK)
                             │ One order can have many order items
                             │
                    ┌────────┘
                    │
                    ▼
          ┌─────────────────┐
          │  ORDER_ITEMS    │
          │─────────────────│
          │ id (PK)         │
          │ order_id (FK)   │──────┐
          │ product_id (FK) │      │
          │ product_name    │      │
          │ quantity        │      │
          │ price           │      │
          │ created_at      │      │
          └─────────────────┘      │
                    │              │
                    │              │
                    │ product_id   │
                    │ (FK)         │
                    │              │
                    ▼              │
          ┌─────────────────┐      │
          │   PRODUCTS      │      │
          │─────────────────│      │
          │ id (PK)         │◄─────┘
          │ name            │
          │ slug            │
          │ description     │
          │ price           │
          │ images          │
          │ category_id (FK)│
          │ created_at      │
          └─────────────────┘
```

---

## 🔗 Relationship Details

### **1. USERS → ORDERS (One-to-Many)**

**Relationship**: One user can place many orders

**Foreign Key**: `orders.user_id` → `users.id`

**Cardinality**: `1:N` (One user to many orders)

**Nullable**: ✅ **YES** - `user_id` can be `NULL` for **guest checkout**

**Example:**
```sql
-- User with ID '123' has placed 3 orders
SELECT * FROM orders WHERE user_id = '123';
```

**Business Logic:**
- Regular users: `user_id` is set to the authenticated user
- Guest users: `user_id` is `NULL`, but email is captured for communication

---

### **2. ORDERS → ORDER_ITEMS (One-to-Many)**

**Relationship**: One order contains many order items (line items)

**Foreign Key**: `order_items.order_id` → `orders.id`

**Cardinality**: `1:N` (One order to many items)

**Nullable**: ❌ **NO** - Every order item must belong to an order

**Example:**
```sql
-- Order with ID 'abc-123' contains 2 items
SELECT * FROM order_items WHERE order_id = 'abc-123';
```

**Business Logic:**
- When an order is created, multiple `order_items` are inserted
- Each item represents one product in the cart at checkout
- Stores `quantity` and `price` at the time of purchase (snapshot)

---

### **3. PRODUCTS → ORDER_ITEMS (One-to-Many)**

**Relationship**: One product can be in many order items

**Foreign Key**: `order_items.product_id` → `products.id`

**Cardinality**: `1:N` (One product to many order items)

**Nullable**: ❌ **NO** - Every order item must reference a product

**Example:**
```sql
-- Product 'xyz-789' has been ordered 50 times
SELECT * FROM order_items WHERE product_id = 'xyz-789';
```

**Business Logic:**
- Links the order item to the actual product
- Even if product is deleted/updated later, order history remains intact
- `product_name` and `price` are stored in `order_items` for historical records

---

## 📝 Key Concepts

### **Why Store Product Info in ORDER_ITEMS?**

The `order_items` table stores **snapshot data** at the time of purchase:

| Column | Why Store It? |
|--------|---------------|
| `product_name` | Product name might change or product might be deleted |
| `price` | Product price might change in the future |
| `quantity` | How many of this product were ordered |

This ensures **order history remains accurate** even if:
- ❌ Product is deleted from the store
- 🔄 Product name is changed
- 💰 Product price is updated

---

### **Guest Checkout (Nullable user_id)**

When `orders.user_id` is `NULL`:
- ✅ Email is still captured in `orders.email`
- ✅ Order confirmation emails are sent
- ✅ Guest cannot view order history (no account)
- ✅ Admin can still manage the order

When user is logged in:
- ✅ `orders.user_id` is set to authenticated user ID
- ✅ User can view order history in `/orders` page
- ✅ User details are pre-filled at checkout

---

## 🔄 Complete Order Flow

### **Scenario: User buys 2 products**

1. **User Action**: Add 2 products to cart, go to checkout

2. **Database Inserts**:

```sql
-- Step 1: Insert into ORDERS table
INSERT INTO orders (
  user_id,           -- '123' (if logged in) or NULL (if guest)
  email,             -- 'customer@example.com'
  first_name,        -- 'John'
  last_name,         -- 'Doe'
  total_amount,      -- 5000
  payment_method,    -- 'bank_transfer'
  payment_status,    -- 'pending'
  status             -- 'pending'
) VALUES (...);

-- Returns: order_id = 'abc-def-123'

-- Step 2: Insert into ORDER_ITEMS table (Item 1)
INSERT INTO order_items (
  order_id,          -- 'abc-def-123' (from step 1)
  product_id,        -- 'prod-111'
  product_name,      -- 'Gold Ring' (snapshot)
  quantity,          -- 2
  price              -- 2000 (snapshot)
) VALUES (...);

-- Step 3: Insert into ORDER_ITEMS table (Item 2)
INSERT INTO order_items (
  order_id,          -- 'abc-def-123' (same order)
  product_id,        -- 'prod-222'
  product_name,      -- 'Silver Necklace' (snapshot)
  quantity,          -- 1
  price              -- 3000 (snapshot)
) VALUES (...);
```

3. **Query Example: Get Full Order with Items**

```sql
SELECT 
  o.id as order_id,
  o.first_name,
  o.last_name,
  o.total_amount,
  o.status,
  oi.product_name,
  oi.quantity,
  oi.price,
  (oi.quantity * oi.price) as item_total,
  p.name as current_product_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.id = 'abc-def-123';
```

**Result:**
| order_id | first_name | total_amount | product_name | quantity | price | item_total | current_product_name |
|----------|------------|--------------|--------------|----------|-------|------------|----------------------|
| abc-def-123 | John | 5000 | Gold Ring | 2 | 2000 | 4000 | Gold Ring (Updated) |
| abc-def-123 | John | 5000 | Silver Necklace | 1 | 3000 | 3000 | Silver Necklace |

---

## 🎯 Summary of Relationships

| Relationship | Type | Foreign Key | Nullable | Purpose |
|--------------|------|-------------|----------|---------|
| **Users → Orders** | 1:N | `orders.user_id` | ✅ Yes | Track which user placed the order (or NULL for guest) |
| **Orders → Order Items** | 1:N | `order_items.order_id` | ❌ No | Break down order into individual products |
| **Products → Order Items** | 1:N | `order_items.product_id` | ❌ No | Link order item to the actual product |

---

## 🔍 Common Queries

### **Get all orders for a specific user:**
```sql
SELECT * FROM orders WHERE user_id = '123';
```

### **Get all items in a specific order:**
```sql
SELECT * FROM order_items WHERE order_id = 'abc-123';
```

### **Get how many times a product has been ordered:**
```sql
SELECT 
  p.name,
  SUM(oi.quantity) as total_ordered
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name;
```

### **Get user's order history with items:**
```sql
SELECT 
  o.id,
  o.created_at,
  o.total_amount,
  o.status,
  oi.product_name,
  oi.quantity,
  oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = '123'
ORDER BY o.created_at DESC;
```

### **Get all guest orders (no account):**
```sql
SELECT * FROM orders WHERE user_id IS NULL;
```

---

## 🛡️ RLS Policy Implications

### **Orders Table:**
- ✅ Anyone can **INSERT** (guest checkout)
- ✅ Users can **SELECT** their own orders (`user_id = auth.uid()`)
- ✅ Admins can **SELECT** all orders
- ✅ Admins can **UPDATE** and **DELETE**

### **Order Items Table:**
- ✅ Anyone can **INSERT** (when creating order)
- ✅ Users can **SELECT** their own order items (via `order_id`)
- ✅ Admins can **SELECT** all order items
- ✅ Admins can **UPDATE** and **DELETE**

---

## 📚 Related Files

- **API**: `src/app/api/orders/route.ts` - Order creation logic
- **Checkout**: `src/app/checkout/page.tsx` - User interface
- **Admin**: `src/app/admin/page.tsx` - Order management
- **Orders Page**: `src/app/orders/page.tsx` - User order history

---

**Last Updated**: October 16, 2025  
**Maintained by**: Development Team

