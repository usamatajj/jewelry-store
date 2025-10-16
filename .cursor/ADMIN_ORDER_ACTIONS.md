# Admin Order Actions Explained

## 📋 Quick Answer

| Button | Changes `status` Column? | Changes `payment_status` Column? | Sends Email? |
|--------|-------------------------|----------------------------------|--------------|
| **Confirm Order** | ✅ YES: `pending` → `processing` | ❌ NO | ✅ YES: "Order Confirmed" |
| **Verify Payment** | ❌ NO | ✅ YES: `pending` → `paid` | ✅ YES: "Payment Verified" |

---

## 🔘 Button 1: "Confirm Order"

### **What It Does:**

**Changes:**
- ✅ Updates `status` column: `pending` → `processing`
- ❌ Does NOT change `payment_status` column
- ✅ Updates `updated_at` timestamp
- ✅ Sends "Order Confirmed" email to customer

**Code:**
```typescript
// Updates only the status column
await supabase
  .from('orders')
  .update({
    status: 'processing',  // ← Only changes this
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId);
```

**Email Sent:**
- Subject: "Your Order is Confirmed!"
- Content: Order confirmed, estimated delivery date, tracking info

---

### **When to Use:**

#### **Bank Transfer Orders:**
- Use **AFTER** payment has been verified (`payment_status = 'paid'`)
- Confirms that you're starting to prepare the order

#### **COD Orders:**
- Use immediately after calling the customer
- Confirms that you'll prepare the order (payment comes later)

---

### **Example Scenarios:**

**Scenario 1: Bank Transfer**
```
Before:
  status: 'pending'
  payment_status: 'paid' (already verified)

After clicking "Confirm Order":
  status: 'processing' ✅ CHANGED
  payment_status: 'paid' (unchanged)
```

**Scenario 2: COD**
```
Before:
  status: 'pending'
  payment_status: 'pending' (will pay on delivery)

After clicking "Confirm Order":
  status: 'processing' ✅ CHANGED
  payment_status: 'pending' (unchanged - still waiting for delivery)
```

---

## 🔘 Button 2: "Verify Payment"

### **What It Does:**

**Changes:**
- ❌ Does NOT change `status` column
- ✅ Updates `payment_status` column: `pending` → `paid`
- ✅ Updates `updated_at` timestamp
- ✅ Sends "Payment Verified" email to customer

**Code:**
```typescript
// Updates only the payment_status column
await supabase
  .from('orders')
  .update({
    payment_status: 'paid',  // ← Only changes this
    updated_at: new Date().toISOString(),
  })
  .eq('id', orderId);
```

**Email Sent:**
- Subject: "Payment Verified"
- Content: Payment confirmed, order will be processed soon

---

### **When to Use:**

#### **Bank Transfer Orders ONLY:**
- Use AFTER viewing the payment screenshot
- Use AFTER confirming payment in your bank account
- Confirms that customer has paid

#### **NOT for COD Orders:**
- This button doesn't show for COD orders
- COD payment is verified after delivery, not before

---

### **Example Scenario:**

**Bank Transfer Payment Verification**
```
Before:
  status: 'pending' (unchanged)
  payment_status: 'pending'

After clicking "Verify Payment":
  status: 'pending' (unchanged - still needs order confirmation)
  payment_status: 'paid' ✅ CHANGED
```

---

## 🔄 Complete Admin Workflows

### **Workflow 1: Bank Transfer Order (2-Step Process)**

```
Step 1: Order Created by Customer
┌──────────────────────────────────────────┐
│ status: 'pending'                        │
│ payment_status: 'pending'                │
│                                          │
│ Message: ⏳ Awaiting payment verification│
│                                          │
│ Actions: [Verify Payment] [Confirm Order]│
└──────────────────────────────────────────┘

↓ Admin checks screenshot and clicks "Verify Payment"

Step 2: Payment Verified
┌──────────────────────────────────────────┐
│ status: 'pending'                        │
│ payment_status: 'paid' ✅                │
│                                          │
│ Message: ✅ Payment verified - Ready     │
│                                          │
│ Actions: [Confirm Order]                 │
└──────────────────────────────────────────┘
│ Email: "Payment Verified" sent to customer
│
↓ Admin clicks "Confirm Order"

Step 3: Order Confirmed
┌──────────────────────────────────────────┐
│ status: 'processing' ✅                  │
│ payment_status: 'paid'                   │
│                                          │
│ Message: (none - normal processing)      │
│                                          │
│ Actions: [Details]                       │
└──────────────────────────────────────────┘
│ Email: "Order Confirmed" sent to customer
│
✅ READY TO PREPARE AND SHIP
```

---

### **Workflow 2: COD Order (1-Step Process)**

```
Step 1: Order Created by Customer
┌──────────────────────────────────────────┐
│ status: 'pending'                        │
│ payment_status: 'pending'                │
│                                          │
│ Message: 📞 COD - Ready to confirm       │
│                                          │
│ Actions: [Confirm Order]                 │
└──────────────────────────────────────────┘
│
│ Admin calls customer to confirm
│
↓ Admin clicks "Confirm Order"

Step 2: Order Confirmed
┌──────────────────────────────────────────┐
│ status: 'processing' ✅                  │
│ payment_status: 'pending' (no change)    │
│                                          │
│ Message: 📦 COD - Being prepared         │
│                                          │
│ Actions: [Details]                       │
└──────────────────────────────────────────┘
│ Email: "Order Confirmed" sent to customer
│
✅ READY TO PREPARE AND SHIP
```

---

## 📊 Database Changes Summary

### **"Confirm Order" Button:**

| Column | Before | After | Notes |
|--------|--------|-------|-------|
| `status` | `pending` | `processing` | ✅ Changes |
| `payment_status` | (any) | (unchanged) | ❌ No change |
| `updated_at` | (old) | (now) | ✅ Updates |

**SQL Query:**
```sql
UPDATE orders
SET status = 'processing',
    updated_at = NOW()
WHERE id = 'order-id';
```

---

### **"Verify Payment" Button:**

| Column | Before | After | Notes |
|--------|--------|-------|-------|
| `status` | (any) | (unchanged) | ❌ No change |
| `payment_status` | `pending` | `paid` | ✅ Changes |
| `updated_at` | (old) | (now) | ✅ Updates |

**SQL Query:**
```sql
UPDATE orders
SET payment_status = 'paid',
    updated_at = NOW()
WHERE id = 'order-id'
AND payment_method = 'bank_transfer';
```

---

## 🚨 Validation & Error Handling

### **"Confirm Order" Validation:**

✅ **Will succeed if:**
- Order `status` is `pending`
- User is admin

❌ **Will fail if:**
- Order `status` is NOT `pending` (already confirmed)
- User is not admin
- Order doesn't exist

**Error Message:**
```
"Order is already processing. Can only confirm pending orders."
```

---

### **"Verify Payment" Validation:**

✅ **Will succeed if:**
- Order `payment_status` is `pending`
- Order `payment_method` is `bank_transfer`
- User is admin

❌ **Will fail if:**
- Order `payment_status` is NOT `pending` (already verified)
- Order `payment_method` is `cash_on_delivery` (COD doesn't need pre-verification)
- User is not admin
- Order doesn't exist

**Error Messages:**
```
"Payment status is already paid. Can only verify pending payments."
"Payment verification is only for bank transfer orders"
```

---

## 💡 Best Practices

### **Bank Transfer Orders:**

1. **ALWAYS verify payment first:**
   - Click "Verify Payment" → Check screenshot
   - Wait for email confirmation
   - Then click "Confirm Order"

2. **Don't skip payment verification:**
   - Clicking "Confirm Order" without verifying payment means you might prepare an order that wasn't paid for
   - Always verify payment first!

---

### **COD Orders:**

1. **Call customer first:**
   - Confirm delivery address
   - Confirm phone number
   - Confirm order details
   - Confirm customer understands COD charges

2. **Then confirm order:**
   - Click "Confirm Order" after successful call
   - Payment verification comes later (after delivery)

---

## 📧 Emails Sent

### **"Confirm Order" Email:**

**Template:** `order-confirmed.html`

**Subject:** "Your Order is Confirmed! 🎉"

**Content:**
- Order number
- Estimated delivery date (5 business days)
- Tracking link
- Order progress timeline
- Contact information

---

### **"Verify Payment" Email:**

**Template:** `payment-verified.html`

**Subject:** "Payment Verified ✓"

**Content:**
- Order number
- Payment amount
- Payment status confirmed
- Next steps (order will be processed)
- Contact information

---

## 🎯 Common Questions

### **Q: Can I confirm an order before verifying payment for bank transfers?**

**A:** Technically yes, the system allows it, but **DON'T DO IT!**

**Why?**
- You might prepare an order that wasn't paid for
- Customer might have uploaded fake screenshot
- You'll lose money

**Best Practice:**
1. First: "Verify Payment" (check screenshot + bank account)
2. Then: "Confirm Order" (start preparing)

---

### **Q: Do I need to verify payment for COD orders?**

**A:** No! The "Verify Payment" button doesn't even show for COD orders.

**Why?**
- COD payment happens at delivery, not before
- Just confirm the order after calling the customer
- Mark payment as received after delivery

---

### **Q: What if I accidentally click the wrong button?**

**A:** You can't undo it from the UI, but you can manually update in Supabase:

```sql
-- Revert order confirmation
UPDATE orders
SET status = 'pending'
WHERE id = 'order-id';

-- Revert payment verification
UPDATE orders
SET payment_status = 'pending'
WHERE id = 'order-id';
```

---

### **Q: Can I confirm an order that's already "processing"?**

**A:** No, the button will return an error:
```
"Order is already processing. Can only confirm pending orders."
```

Orders can only be confirmed once.

---

## 📋 Quick Reference

| If you see this... | Click this button... | To do this... |
|-------------------|---------------------|---------------|
| Order: pending, Payment: pending, 🏦 Bank Transfer | **Verify Payment** | Check screenshot, mark payment as verified |
| Order: pending, Payment: paid, 🏦 Bank Transfer | **Confirm Order** | Start preparing the order |
| Order: pending, Payment: pending, 💰 COD | **Confirm Order** | Start preparing (after calling customer) |

---

**Last Updated**: October 16, 2025  
**Maintained by**: Development Team

