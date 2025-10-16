# Order Status vs Payment Status

## 🤔 Why Two Status Columns?

The `orders` table has **two separate status columns** because they track **different aspects** of the order lifecycle:

1. **`status`** - Tracks the **order fulfillment/shipping progress**
2. **`payment_status`** - Tracks the **payment verification progress**

---

## 📊 Column Definitions

### **1. `status` Column (Order Fulfillment)**

**Purpose**: Tracks where the order is in the **fulfillment pipeline**

**Possible Values**:
```sql
'pending'     -- Order placed, awaiting admin confirmation
'processing'  -- Order confirmed, being prepared for shipment
'shipped'     -- Order dispatched, on the way to customer
'delivered'   -- Order received by customer
'cancelled'   -- Order cancelled
```

**What it means**: "Where is my order in the delivery process?"

---

### **2. `payment_status` Column (Payment Verification)**

**Purpose**: Tracks whether the **payment has been verified/received**

**Possible Values**:
```sql
'pending'   -- Awaiting payment verification
'paid'      -- Payment verified and confirmed
'failed'    -- Payment failed (rare)
'refunded'  -- Payment refunded to customer
```

**What it means**: "Has the customer paid for this order?"

---

## 🔄 Real-World Scenarios

### **Scenario 1: Bank Transfer Order**

```
Timeline:
─────────────────────────────────────────────────────────►

1. Customer places order
   status: 'pending'
   payment_status: 'pending'
   
2. Admin verifies bank transfer screenshot
   status: 'pending'
   payment_status: 'paid' ✅ (payment confirmed)
   
3. Admin confirms order and starts preparing items
   status: 'processing' ✅
   payment_status: 'paid'
   
4. Order is shipped
   status: 'shipped' ✅
   payment_status: 'paid'
   
5. Customer receives order
   status: 'delivered' ✅
   payment_status: 'paid'
```

**Key Point**: Payment must be verified **before** order can be processed.

---

### **Scenario 2: Cash on Delivery (COD) Order**

```
Timeline:
─────────────────────────────────────────────────────────►

1. Customer places COD order
   status: 'pending'
   payment_status: 'pending' (will pay on delivery)
   
2. Admin confirms order via phone
   status: 'processing' ✅
   payment_status: 'pending' (still waiting for delivery)
   
3. Order is shipped
   status: 'shipped' ✅
   payment_status: 'pending' (still waiting for cash)
   
4. Customer receives order and pays cash to delivery person
   status: 'delivered' ✅
   payment_status: 'paid' ✅ (cash received)
```

**Key Point**: For COD, order is processed **before** payment is received.

---

## 💡 Why Both Are Needed

### **Without Separate Columns:**

❌ **Problem**: You can't distinguish between:
- "Order is pending because payment is not verified"
- "Order is pending because admin hasn't confirmed it yet"

### **With Separate Columns:**

✅ **Solution**: You can track both independently:
- `status = 'pending'` + `payment_status = 'pending'` → "Need to verify payment first"
- `status = 'pending'` + `payment_status = 'paid'` → "Payment verified, waiting for admin to confirm order"
- `status = 'processing'` + `payment_status = 'pending'` → "Order is being prepared, will collect payment on delivery (COD)"

---

## 📋 State Matrix (All Possible Combinations)

| status | payment_status | Meaning | Common For | Admin Action |
|--------|---------------|---------|------------|--------------|
| **pending** | **pending** | Order placed, payment not verified | Bank Transfer | Verify payment screenshot |
| **pending** | **paid** | Payment verified, order not confirmed | Bank Transfer | Confirm order |
| **processing** | **pending** | Order being prepared, will pay on delivery | COD | Prepare items, ship order |
| **processing** | **paid** | Payment received, order being prepared | Bank Transfer | Prepare items, ship order |
| **shipped** | **pending** | Order shipped, payment on delivery | COD | Track delivery, collect cash |
| **shipped** | **paid** | Order shipped, payment received | Bank Transfer | Track delivery |
| **delivered** | **pending** | Delivered but payment not received | COD (if issue) | Follow up on payment |
| **delivered** | **paid** | Order completed successfully | All | Order complete ✅ |
| **cancelled** | **pending** | Order cancelled before payment | All | Refund not needed |
| **cancelled** | **paid** | Order cancelled after payment | Bank Transfer | Refund customer |
| **cancelled** | **refunded** | Order cancelled and refunded | Bank Transfer | Order complete ✅ |

---

## 🎯 Business Logic Examples

### **Example 1: Admin Order Management**

**Admin Dashboard View:**

```typescript
// Show different action buttons based on both statuses

if (order.status === 'pending') {
  // Show "Confirm Order" button
}

if (order.payment_status === 'pending' && order.payment_method === 'bank_transfer') {
  // Show "Verify Payment" button
}

if (order.status === 'processing' && order.payment_status === 'paid') {
  // Show "Ship Order" button
}

if (order.status === 'shipped') {
  // Show "Mark as Delivered" button
}

if (order.status === 'delivered' && order.payment_status === 'pending') {
  // Show "Confirm Payment Received" button (for COD)
}
```

---

### **Example 2: Customer Order Tracking**

```typescript
function getOrderMessage(order) {
  // Bank Transfer Orders
  if (order.payment_method === 'bank_transfer') {
    if (order.payment_status === 'pending') {
      return "⏳ We're verifying your payment. This usually takes 24 hours.";
    }
    if (order.status === 'pending' && order.payment_status === 'paid') {
      return "✅ Payment verified! Your order will be processed soon.";
    }
    if (order.status === 'processing') {
      return "📦 Your order is being prepared for shipment.";
    }
    if (order.status === 'shipped') {
      return "🚚 Your order is on the way!";
    }
    if (order.status === 'delivered') {
      return "✨ Order delivered! Thank you for shopping with us.";
    }
  }
  
  // COD Orders
  if (order.payment_method === 'cash_on_delivery') {
    if (order.status === 'pending') {
      return "⏳ We'll call you soon to confirm your order.";
    }
    if (order.status === 'processing') {
      return "📦 Your order is being prepared. Please keep exact cash ready.";
    }
    if (order.status === 'shipped') {
      return "🚚 Your order is on the way! Pay cash on delivery.";
    }
    if (order.status === 'delivered') {
      return "✨ Order delivered! Thank you for shopping with us.";
    }
  }
}
```

---

### **Example 3: Analytics and Reporting**

```sql
-- Get all orders with verified payments (safe to process)
SELECT * FROM orders 
WHERE payment_status = 'paid' 
AND status = 'pending';

-- Get all COD orders that are shipped (cash not yet collected)
SELECT * FROM orders 
WHERE payment_method = 'cash_on_delivery'
AND status = 'shipped'
AND payment_status = 'pending';

-- Get total confirmed revenue (only paid orders)
SELECT SUM(total_amount) FROM orders 
WHERE payment_status = 'paid';

-- Get orders stuck in payment verification
SELECT * FROM orders 
WHERE payment_status = 'pending'
AND payment_method = 'bank_transfer'
AND created_at < NOW() - INTERVAL '48 hours';
```

---

## 🔄 Typical Order Flow by Payment Method

### **Bank Transfer Flow:**

```
1. Order Created
   ├─ status: 'pending'
   └─ payment_status: 'pending'
   
2. Admin Verifies Payment Screenshot
   ├─ status: 'pending'
   └─ payment_status: 'paid' ← Changed
   
3. Admin Confirms Order
   ├─ status: 'processing' ← Changed
   └─ payment_status: 'paid'
   
4. Order Shipped
   ├─ status: 'shipped' ← Changed
   └─ payment_status: 'paid'
   
5. Order Delivered
   ├─ status: 'delivered' ← Changed
   └─ payment_status: 'paid'
   
✅ COMPLETE
```

---

### **COD Flow:**

```
1. Order Created
   ├─ status: 'pending'
   └─ payment_status: 'pending'
   
2. Admin Confirms Order (no payment verification needed)
   ├─ status: 'processing' ← Changed
   └─ payment_status: 'pending'
   
3. Order Shipped
   ├─ status: 'shipped' ← Changed
   └─ payment_status: 'pending'
   
4. Order Delivered + Cash Collected
   ├─ status: 'delivered' ← Changed
   └─ payment_status: 'paid' ← Changed
   
✅ COMPLETE
```

---

## 🎨 UI Display Examples

### **Admin Panel Badge Colors:**

```typescript
// Order Status Badges
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':     return 'bg-yellow-100 text-yellow-800';
    case 'processing':  return 'bg-blue-100 text-blue-800';
    case 'shipped':     return 'bg-purple-100 text-purple-800';
    case 'delivered':   return 'bg-green-100 text-green-800';
    case 'cancelled':   return 'bg-red-100 text-red-800';
    default:            return 'bg-gray-100 text-gray-800';
  }
};

// Payment Status Badges
const getPaymentStatusColor = (paymentStatus: string) => {
  switch (paymentStatus) {
    case 'pending':   return 'bg-yellow-100 text-yellow-800';
    case 'paid':      return 'bg-green-100 text-green-800';
    case 'failed':    return 'bg-red-100 text-red-800';
    case 'refunded':  return 'bg-gray-100 text-gray-800';
    default:          return 'bg-gray-100 text-gray-800';
  }
};
```

**Visual Example:**
```
Order #12345    [PENDING]    [PENDING]
                  ↑              ↑
               status      payment_status

Order #12346    [PROCESSING] [PAID]
                  ↑              ↑
           (being prepared)  (payment verified)

Order #12347    [SHIPPED]    [PENDING]
                  ↑              ↑
             (on the way)   (COD - will pay on arrival)
```

---

## 🛡️ Validation Rules

### **Business Rules to Enforce:**

1. **Can't ship without confirming order:**
   ```typescript
   if (status === 'shipped' && previousStatus === 'pending') {
     throw new Error('Must confirm order before shipping');
   }
   ```

2. **Bank Transfer: Can't process without payment verification:**
   ```typescript
   if (payment_method === 'bank_transfer' && 
       status === 'processing' && 
       payment_status === 'pending') {
     throw new Error('Must verify payment before processing bank transfer orders');
   }
   ```

3. **Can't mark as delivered before shipping:**
   ```typescript
   if (status === 'delivered' && previousStatus !== 'shipped') {
     throw new Error('Order must be shipped before marking as delivered');
   }
   ```

---

## 📊 Summary

| Column | Tracks | Updated By | Examples |
|--------|--------|------------|----------|
| **`status`** | **Order fulfillment** | Admin (manual) or System (automated) | pending → processing → shipped → delivered |
| **`payment_status`** | **Payment verification** | Admin (verifies payment) or System (records payment) | pending → paid |

### **Key Takeaway:**

- **`status`**: "Where is my package?" (Physical order tracking)
- **`payment_status`**: "Did the customer pay?" (Financial tracking)

Both columns are essential for:
- ✅ Supporting multiple payment methods (bank transfer vs COD)
- ✅ Accurate order tracking and customer communication
- ✅ Financial reporting and reconciliation
- ✅ Admin workflow management

---

**Last Updated**: October 16, 2025  
**Maintained by**: Development Team

