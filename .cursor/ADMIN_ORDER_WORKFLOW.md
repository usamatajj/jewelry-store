# Admin Order Management Workflow

## 📋 Complete Order Lifecycle Management

Admins can now manually update order status through the entire lifecycle from the admin panel.

---

## 🔄 Order Status Flow

```
pending → processing → shipped → delivered
    ↓
cancelled
```

---

## 🎯 Status-Based Actions

### **1. Order Status: `pending`**

**Available Actions:**
- ✅ **Confirm Order** → Changes status to `processing`
- ✅ **Verify Payment** (Bank Transfer only) → Changes `payment_status` to `paid`
- ❌ **Cancel Order** → Changes status to `cancelled`

**When to use:**
- **Bank Transfer:** Verify payment screenshot first, then confirm order
- **COD:** Call customer to confirm, then click "Confirm Order"

---

### **2. Order Status: `processing`**

**Available Actions:**
- 📦 **Mark as Shipped** → Changes status to `shipped`
- ❌ **Cancel Order** → Changes status to `cancelled`

**When to use:**
- Order has been prepared and is ready to ship
- Package handed over to courier

---

### **3. Order Status: `shipped`**

**Available Actions:**
- ✅ **Mark as Delivered** → Changes status to `delivered`

**When to use:**
- Customer has received the package
- Delivery confirmation received

---

### **4. Order Status: `delivered`**

**Available Actions:**
- 💰 **Mark Payment Received** (COD only) → Changes `payment_status` to `paid`

**When to use:**
- For COD orders, when cash has been collected from customer
- Delivery person confirms payment received

---

### **5. Order Status: `cancelled`**

**Available Actions:**
- None (final status)

**When to use:**
- Customer requested cancellation
- Unable to fulfill order
- Payment not verified

---

## 💳 Payment Status Management

### **Bank Transfer Orders:**

**Flow:**
```
1. Order placed → payment_status: 'pending'
2. Admin verifies screenshot → payment_status: 'paid' ✅
3. Admin confirms order → status: 'processing'
4. Admin marks as shipped → status: 'shipped'
5. Admin marks as delivered → status: 'delivered'
```

**Key Point:** Verify payment BEFORE confirming order!

---

### **COD Orders:**

**Flow:**
```
1. Order placed → payment_status: 'pending'
2. Admin calls customer
3. Admin confirms order → status: 'processing'
4. Admin marks as shipped → status: 'shipped'
5. Admin marks as delivered → status: 'delivered'
6. Admin marks payment received → payment_status: 'paid' ✅
```

**Key Point:** Payment is verified AFTER delivery!

---

## 🎨 Button Colors Guide

| Button | Color | Meaning |
|--------|-------|---------|
| **Confirm Order** | Green | Start processing |
| **Verify Payment** | Blue | Check bank transfer |
| **Mark as Shipped** | Purple | Package sent |
| **Mark as Delivered** | Green | Customer received |
| **Mark Payment Received** | Green | COD cash collected |
| **Cancel Order** | Red | Cancel order |
| **Details** | Gray outline | View order details |

---

## 📊 Complete Workflow Examples

### **Example 1: Bank Transfer Order**

```
Step 1: Customer places order
├─ status: 'pending'
└─ payment_status: 'pending'

Step 2: Admin clicks "Verify Payment"
├─ Checks bank transfer screenshot
├─ Confirms payment in bank account
└─ payment_status: 'paid' ✅

Step 3: Admin clicks "Confirm Order"
├─ status: 'processing' ✅
└─ Email: "Order Confirmed" sent

Step 4: Admin prepares order and clicks "Mark as Shipped"
├─ status: 'shipped' ✅
└─ Package handed to courier

Step 5: Customer receives order, Admin clicks "Mark as Delivered"
├─ status: 'delivered' ✅
└─ Order complete! 🎉
```

---

### **Example 2: COD Order**

```
Step 1: Customer places order
├─ status: 'pending'
└─ payment_status: 'pending'

Step 2: Admin calls customer to confirm
└─ Customer confirms order details

Step 3: Admin clicks "Confirm Order"
├─ status: 'processing' ✅
└─ Email: "Order Confirmed" sent

Step 4: Admin prepares order and clicks "Mark as Shipped"
├─ status: 'shipped' ✅
└─ Package handed to courier with COD tag

Step 5: Customer receives and pays cash
└─ Delivery person collects payment

Step 6: Admin clicks "Mark as Delivered"
├─ status: 'delivered' ✅
└─ payment_status: 'pending' (still)

Step 7: Admin clicks "Mark Payment Received"
├─ payment_status: 'paid' ✅
└─ Order complete! 🎉
```

---

## 🚨 Important Notes

### **Manual Payment Verification:**

✅ **Bank Transfer:**
1. Check payment screenshot uploaded by customer
2. Log into your bank account
3. Verify payment amount matches order total
4. Confirm payment date matches order date
5. Then click "Verify Payment" in admin panel

✅ **COD:**
1. Delivery person collects cash from customer
2. Delivery person returns with cash
3. Count cash and verify amount
4. Then click "Mark Payment Received" in admin panel

---

### **Order Cancellation:**

⚠️ **Can only cancel:**
- Orders in `pending` status
- Orders in `processing` status

❌ **Cannot cancel:**
- Orders already `shipped`
- Orders already `delivered`
- Orders already `cancelled`

**Confirmation required:** System will ask for confirmation before cancelling.

---

## 📱 Admin Panel UI

### **Order Card Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ #ORDER_ID  Order: [badge]  Payment: [badge]  [Method badge] │
│                                                              │
│ [Status Message]                                             │
│                                                              │
│ Customer Name - email                                        │
│ Date and Time                                                │
│ Total Amount                                                 │
│                                                              │
│ [Action Buttons based on current status]                    │
└─────────────────────────────────────────────────────────────┘
```

---

### **Buttons Displayed by Status:**

| Current Status | Buttons Shown |
|----------------|---------------|
| **pending** | Confirm Order, Verify Payment (if bank), Cancel |
| **processing** | Mark as Shipped, Cancel |
| **shipped** | Mark as Delivered |
| **delivered** (COD) | Mark Payment Received |
| **delivered** (paid) | Details only |
| **cancelled** | Details only |

---

## 💡 Best Practices

### **Bank Transfer Orders:**

1. ✅ **Always verify payment first**
   - Don't confirm order before verifying payment
   - Check bank account, not just screenshot

2. ✅ **Keep payment screenshots organized**
   - Screenshots stored in Supabase Storage
   - Can view in order details

3. ✅ **Respond within 24 hours**
   - Customer expects quick verification
   - Set up bank alerts for incoming payments

---

### **COD Orders:**

1. ✅ **Call customer before confirming**
   - Verify phone number
   - Confirm delivery address
   - Confirm COD charges

2. ✅ **Mark payment as received only after counting cash**
   - Don't mark paid until you have the cash
   - Verify amount matches order total

3. ✅ **Track COD cash separately**
   - Keep COD collections separate
   - Reconcile daily

---

## 🔍 Monitoring

### **Check Order Status:**

**In Admin Panel:**
- Orders tab shows all orders
- Color-coded status badges
- Action buttons for next steps

**Status Badges:**
- 🟡 **Yellow**: pending
- 🔵 **Blue**: processing
- 🟣 **Purple**: shipped
- 🟢 **Green**: delivered
- 🔴 **Red**: cancelled

---

## 📊 Order Metrics

### **Track These KPIs:**

1. **Pending Orders** - Waiting for your action
2. **Payment Verification Time** - How long to verify
3. **Fulfillment Time** - Pending → Delivered
4. **COD Collection Rate** - % of COD orders paid
5. **Cancellation Rate** - % of cancelled orders

---

## 🆘 Troubleshooting

### **"Failed to update status"**

**Causes:**
- Not logged in as admin
- Network error
- Invalid status transition

**Solution:**
- Refresh page and try again
- Check admin permissions
- Contact support if persists

---

### **"Payment already verified"**

**Cause:**
- Payment status is already 'paid'

**Solution:**
- Payment was already verified
- No action needed

---

### **"Order is already processing"**

**Cause:**
- Order was already confirmed

**Solution:**
- Use other buttons (Mark as Shipped, etc.)
- Order cannot be confirmed twice

---

## ✅ Quick Reference

| I want to... | Current Status | Click... |
|--------------|----------------|----------|
| Start preparing order | pending | **Confirm Order** |
| Verify bank payment | pending (bank) | **Verify Payment** |
| Mark order shipped | processing | **Mark as Shipped** |
| Mark order delivered | shipped | **Mark as Delivered** |
| Record COD payment | delivered (COD) | **Mark Payment Received** |
| Cancel order | pending/processing | **Cancel Order** |

---

**Last Updated**: October 16, 2025  
**Maintained by**: Development Team

