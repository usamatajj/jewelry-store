# Guest Checkout Setup

## 🎯 Overview

The checkout system now supports **guest checkout**, allowing users to place orders without creating an account. This improves conversion rates and reduces friction in the buying process.

## ✅ What Changed

### Checkout Flow:

- ✅ Users can checkout **without logging in**
- ✅ `user_id` is set to `NULL` for guest orders
- ✅ Email and phone captured for communication
- ✅ Order confirmation sent via email
- ✅ Guest users see option to "Sign In to Track Order" after purchase

### Pre-filled Fields:

If user **IS logged in**, the form pre-fills:

- ✅ Email
- ✅ First Name
- ✅ Last Name

If user **is NOT logged in** (guest):

- ⚠️ All fields empty and must be filled manually

## 🔒 Storage Policy Update Required

### ⚠️ Important: RLS Policy Change

The current storage policies require **authenticated users** to upload payment screenshots. For guest checkout to work, we need to allow **anonymous uploads**.

### Updated SQL for Storage Policies:

```sql
-- DROP old authenticated-only policy
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- CREATE new policy allowing anonymous uploads to payment-screenshots
CREATE POLICY "Allow guest payment screenshot uploads"
ON storage.objects
FOR INSERT
TO public  -- This allows both authenticated and anonymous users
WITH CHECK (
  bucket_id = 'payment-screenshots'
);

-- Keep read policy for authenticated users
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;

CREATE POLICY "Allow authenticated payment screenshot reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots'
);

-- Admin policies remain the same
DROP POLICY IF EXISTS "Allow admin updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes" ON storage.objects;

CREATE POLICY "Allow admin updates on payment screenshots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
)
WITH CHECK (
  bucket_id = 'payment-screenshots' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

CREATE POLICY "Allow admin deletes on payment screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

## 📊 Database Schema

### Orders Table:

The `user_id` column is already **nullable**, which is perfect for guest checkout:

```sql
user_id uuid NULL  -- NULL for guest orders
```

### Finding Guest Orders:

```sql
-- All guest orders
SELECT * FROM orders WHERE user_id IS NULL;

-- Guest orders by email
SELECT * FROM orders WHERE user_id IS NULL AND email = 'guest@example.com';

-- All orders for a specific email (both guest and registered)
SELECT * FROM orders WHERE email = 'customer@example.com';
```

## 🎨 UI Changes

### Guest Checkout Banner:

A blue info banner appears at the top of checkout page for non-logged-in users:

```
🔵 Guest Checkout: You can place an order without creating an account.
   We'll use your email to send order confirmation and updates.

   Have an account? Sign in to track all your orders easily.
```

### Success Page:

After order completion, guests see:

- ✅ Order confirmation
- ✅ "Sign In to Track Order" button (instead of "View Orders")
- ✅ "Continue Shopping" button

## 📧 Email Communication

### Guest Orders:

- ✅ Order confirmation email sent
- ✅ Email contains order number
- ✅ Email contains all order details
- ✅ Customer can reference order number for support

### Recommendation:

Consider adding an "Order Lookup" page where guests can:

- Enter email + order number
- View order status
- Download invoice
- Contact support

## 🔐 Security Considerations

### Payment Screenshot Uploads:

- ⚠️ **Risk**: Anonymous users can upload files
- ✅ **Mitigation**: File type validation (images only)
- ✅ **Mitigation**: File size limit (5MB max)
- ✅ **Mitigation**: Files stored in private bucket
- ✅ **Mitigation**: Only admins can delete files

### Spam Prevention:

Consider implementing:

- Rate limiting on order creation
- CAPTCHA on checkout form
- Email verification before order processing
- Phone number validation

## 🚀 Testing Guest Checkout

### Test Flow:

1. **Logout** (if logged in)
2. Add product to cart
3. Go to checkout
4. See guest checkout banner
5. Fill all fields manually
6. Select payment method
7. Upload payment screenshot (for bank transfer)
8. Submit order
9. Verify order created with `user_id = NULL`
10. Check email received
11. See "Sign In to Track Order" button

### SQL Verification:

```sql
-- Check last guest order
SELECT id, email, first_name, last_name, user_id, payment_method, created_at
FROM orders
WHERE user_id IS NULL
ORDER BY created_at DESC
LIMIT 1;

-- Check guest order items
SELECT oi.*, p.name as product_name
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 'YOUR_ORDER_ID';
```

## 🎯 Future Enhancements

### Order Tracking for Guests:

Create `/track-order` page:

```typescript
// Input: Email + Order Number
// Output: Order status, items, tracking info
```

### Account Creation Prompt:

After successful guest checkout, prompt:

- "Create an account to track this order and future orders"
- Pre-fill email and name
- Only need password

### Order History Migration:

When guest creates account later:

```sql
-- Link guest orders to new user account
UPDATE orders
SET user_id = 'NEW_USER_ID'
WHERE email = 'user@example.com'
AND user_id IS NULL;
```

## 📋 Updated Setup Steps

### 1. Database (Already Done):

```sql
-- user_id is already nullable
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
```

### 2. Storage Policies (REQUIRED):

Run the updated SQL above to allow anonymous uploads.

### 3. Code (Already Updated):

- ✅ Checkout page allows null user
- ✅ Pre-fills form if user logged in
- ✅ Shows guest info banner
- ✅ API accepts null user_id
- ✅ Success page adapts for guests

### 4. Test:

- ✅ Logout and test full flow
- ✅ Verify order created
- ✅ Check email sent
- ✅ Test with logged-in user too

## 🆘 Troubleshooting

### "Permission denied" on screenshot upload:

**Cause**: Storage policy still requires authentication  
**Fix**: Run updated storage policies SQL above

### "user_id cannot be null" error:

**Cause**: Database constraint issue  
**Fix**: Check `orders` table allows NULL for `user_id`

```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'user_id';
-- Should show: is_nullable = YES
```

### Email not sent for guest orders:

**Cause**: Email service might expect user object  
**Fix**: Check email template uses `first_name` and `email` from order data, not user object

## 📊 Analytics Tracking

### Metrics to Monitor:

- Guest checkout rate vs. logged-in checkout rate
- Guest order completion rate
- Guest to registered user conversion rate
- Average order value: guest vs. registered

### SQL Queries:

```sql
-- Guest vs. Registered orders
SELECT
  CASE WHEN user_id IS NULL THEN 'Guest' ELSE 'Registered' END as customer_type,
  COUNT(*) as order_count,
  AVG(total_amount) as avg_order_value
FROM orders
GROUP BY customer_type;

-- Guest orders by payment method
SELECT
  payment_method,
  COUNT(*) as count
FROM orders
WHERE user_id IS NULL
GROUP BY payment_method;
```

## ✅ Benefits

### For Customers:

- ✅ Faster checkout (no signup required)
- ✅ Less friction in buying process
- ✅ Privacy (no account needed)
- ✅ Still get order confirmation

### For Business:

- ✅ Higher conversion rates
- ✅ More completed orders
- ✅ Capture email for marketing
- ✅ Option to convert guests later

---

**Status**: ✅ Implemented  
**Requires**: Storage policy update for anonymous uploads  
**Last Updated**: October 4, 2025
