# Email System & Order Management Guide

## 📧 Overview

This guide explains the email system and admin order management workflow implemented in the Eterna Jewels jewelry store.

## 🎯 Email Flow

### 1. **Order Placed Email** (Automatic)
**Trigger:** Customer completes checkout  
**Status:** `status='pending'`, `payment_status='pending'`  
**Template:** `templates/email/order-placed.html`  
**Content:**
- Order confirmation
- Order number and date
- Items list with quantities
- Price breakdown (subtotal, shipping, COD charges)
- Payment method details
- Delivery address
- Next steps

### 2. **Order Confirmed Email** (Admin Action)
**Trigger:** Admin clicks "Confirm Order" button  
**Status Change:** `status: 'pending' → 'processing'`  
**Template:** `templates/email/order-confirmed.html`  
**Content:**
- Order confirmation
- Order is being processed
- Estimated delivery date (5 business days)
- What happens next (4-step process)
- Order tracking link

### 3. **Payment Verified Email** (Admin Action - Bank Transfer Only)
**Trigger:** Admin clicks "Verify Payment" button  
**Status Change:** `payment_status: 'pending' → 'paid'`  
**Template:** `templates/email/payment-verified.html`  
**Content:**
- Payment confirmation
- Amount paid
- Order will now be processed

---

## 📋 Order Status Workflow

### Order Statuses (`status` column):

```
pending → processing → shipped → delivered
   ↓
cancelled
```

| Status | Description | Admin Action |
|--------|-------------|--------------|
| **pending** | Order received, awaiting admin review | Click "Confirm Order" |
| **processing** | Order confirmed, being prepared | Manual update |
| **shipped** | Order dispatched for delivery | Manual update |
| **delivered** | Order received by customer | Manual update |
| **cancelled** | Order cancelled | Manual update |

### Payment Statuses (`payment_status` column):

```
pending → paid (or failed/refunded)
```

| Status | Description | When |
|--------|-------------|------|
| **pending** | Payment not verified | Default for all orders |
| **paid** | Payment confirmed | Admin verifies bank transfer screenshot |
| **failed** | Payment failed | Manual update |
| **refunded** | Payment refunded | Manual update |

---

## 🔧 Admin Panel Order Management

### Orders Tab Features:

#### **Order Card Display:**
- Order ID (#12345678)
- Customer name and email
- Order date and time
- Total amount (Rs)
- Status badge (color-coded)
- Payment status badge (color-coded)
- Action buttons

#### **Action Buttons:**

1. **Confirm Order** (Green button)
   - **Visible:** When `status='pending'`
   - **Action:** Changes `status` to `'processing'`
   - **Email:** Sends "Order Confirmed" email
   - **Use Case:** Admin reviews order and confirms it

2. **Verify Payment** (Blue outlined button)
   - **Visible:** When `payment_method='bank_transfer'` AND `payment_status='pending'`
   - **Action:** Changes `payment_status` to `'paid'`
   - **Email:** Sends "Payment Verified" email
   - **Use Case:** Admin checks bank transfer screenshot and confirms payment

3. **Details** (Outlined button)
   - **Action:** View full order details
   - **Always visible**

---

## 🎨 Badge Colors

### Status Colors:
- 🟡 **pending** - Yellow
- 🔵 **processing** - Blue
- 🟣 **shipped** - Purple
- 🟢 **delivered** - Green
- 🔴 **cancelled** - Red

### Payment Status Colors:
- 🟡 **pending** - Yellow
- 🟢 **paid** - Green
- 🔴 **failed** - Red
- ⚪ **refunded** - Gray

---

## 📂 File Structure

```
/Users/usama-taj-mba/Projects/jewelry-store/
├── templates/
│   └── email/
│       ├── order-placed.html           # Order placed email template
│       ├── order-confirmed.html        # Order confirmed email template
│       └── payment-verified.html       # Payment verified email template
├── src/
│   ├── lib/
│   │   └── email.ts                    # Email utility functions
│   ├── app/
│   │   ├── api/
│   │   │   ├── orders/
│   │   │   │   └── route.ts            # Order creation API (sends order placed email)
│   │   │   └── admin/
│   │   │       └── orders/
│   │   │           └── [id]/
│   │   │               ├── confirm/
│   │   │               │   └── route.ts    # Confirm order API
│   │   │               └── verify-payment/
│   │   │                   └── route.ts    # Verify payment API
│   │   └── admin/
│   │       └── page.tsx                # Admin panel with order management
│   └── checkout/
│       └── page.tsx                    # Checkout page (triggers order creation)
└── .env.local
    └── RESEND_API_KEY=your_key_here    # Required for email sending
```

---

## 🚀 Implementation Details

### Email Functions (`src/lib/email.ts`)

#### 1. **sendOrderPlacedEmail(data)**
```typescript
interface OrderPlacedData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  shipping: string;
  codCharges?: string;
  total: string;
  shippingAddress: string;
  isBankTransfer: boolean;
  freeShipping: boolean;
}
```

#### 2. **sendOrderConfirmedEmail(data)**
```typescript
interface OrderConfirmedData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  orderTrackingURL?: string;
}
```

#### 3. **sendPaymentVerifiedEmail(data)**
```typescript
interface PaymentVerifiedData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  totalAmount: string;
}
```

---

## 🔑 API Endpoints

### 1. POST `/api/orders`
**Purpose:** Create new order and send order placed email  
**Auth:** Public (guest checkout supported)  
**Email:** Automatic - Order Placed

### 2. POST `/api/admin/orders/[id]/confirm`
**Purpose:** Confirm order (pending → processing)  
**Auth:** Admin only  
**Email:** Order Confirmed  
**Response:**
```json
{
  "success": true,
  "message": "Order confirmed successfully",
  "emailSent": true
}
```

### 3. POST `/api/admin/orders/[id]/verify-payment`
**Purpose:** Verify payment (pending → paid)  
**Auth:** Admin only  
**Email:** Payment Verified  
**Restrictions:** Bank transfer orders only  
**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "emailSent": true
}
```

---

## 📧 Email Provider Setup

### Using Resend (Recommended)

1. **Sign up at:** https://resend.com
2. **Get API Key**
3. **Add to `.env.local`:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. **Verify domain:** `eternajewels.com` (or use Resend's test domain)

### Email Configuration:
- **From:** `Eterna Jewels <orders@eternajewels.com>`
- **Provider:** Resend API
- **Templates:** HTML files in `templates/email/`

---

## 🧪 Testing Workflow

### Test Scenario 1: Bank Transfer Order

1. **Customer:** Places order with bank transfer
   - ✅ Order created: `status='pending'`, `payment_status='pending'`
   - ✅ Email: Order Placed (bank transfer instructions)

2. **Admin:** Verifies payment screenshot
   - ✅ Clicks "Verify Payment"
   - ✅ Status: `payment_status='paid'`
   - ✅ Email: Payment Verified

3. **Admin:** Confirms order
   - ✅ Clicks "Confirm Order"
   - ✅ Status: `status='processing'`
   - ✅ Email: Order Confirmed

### Test Scenario 2: Cash on Delivery Order

1. **Customer:** Places order with COD
   - ✅ Order created: `status='pending'`, `payment_status='pending'`
   - ✅ Email: Order Placed (COD instructions)

2. **Admin:** Confirms order
   - ✅ Clicks "Confirm Order"
   - ✅ Status: `status='processing'`
   - ✅ Email: Order Confirmed
   - ⚠️ No "Verify Payment" button (COD payment on delivery)

---

## 🎯 Order Management Best Practices

### For Bank Transfer Orders:
1. Customer uploads payment screenshot
2. Admin views screenshot in order details
3. Admin verifies payment → `payment_status='paid'`
4. Admin confirms order → `status='processing'`
5. Process and ship order

### For COD Orders:
1. Admin confirms order → `status='processing'`
2. Team may call customer to confirm
3. Process and ship order with COD instructions
4. Update `payment_status='paid'` after successful delivery

---

## 🔒 Security & Permissions

### Admin-Only Actions:
- Confirm order
- Verify payment
- Update order status
- View payment screenshots

### Auth Check:
```typescript
// Check if user is admin
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

if (userData?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 🐛 Troubleshooting

### Issue: Emails not sending

**Check:**
1. `RESEND_API_KEY` is set in `.env.local`
2. API key is valid
3. Domain is verified in Resend dashboard
4. Check console logs for error messages

### Issue: "Confirm Order" button not showing

**Check:**
- Order `status` is `'pending'`
- Reload admin page to refresh order list

### Issue: "Verify Payment" button not showing

**Check:**
- Order `payment_method` is `'bank_transfer'`
- Order `payment_status` is `'pending'`
- Button only appears for bank transfer orders

### Issue: Email sent but not received

**Check:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Resend dashboard for delivery status
4. Try with a different email provider

---

## 📊 Email Template Variables

### Order Placed Template:
- `{{customerName}}` - Full name
- `{{orderNumber}}` - 8-character order ID
- `{{orderDate}}` - Formatted date
- `{{paymentMethod}}` - Bank Transfer or Cash on Delivery
- `{{items}}` - Array of order items
- `{{subtotal}}` - Order subtotal
- `{{shipping}}` - Shipping cost
- `{{codCharges}}` - COD charges (optional)
- `{{total}}` - Grand total
- `{{shippingAddress}}` - Full delivery address
- `{{customerEmail}}` - Customer email

### Order Confirmed Template:
- `{{customerName}}` - Full name
- `{{orderNumber}}` - 8-character order ID
- `{{estimatedDelivery}}` - Formatted delivery date
- `{{trackingNumber}}` - Tracking number (optional)
- `{{orderTrackingURL}}` - Link to track order
- `{{customerEmail}}` - Customer email

### Payment Verified Template:
- `{{customerName}}` - Full name
- `{{orderNumber}}` - 8-character order ID
- `{{totalAmount}}` - Amount paid
- `{{customerEmail}}` - Customer email

---

## ✅ Checklist for Going Live

- [ ] Resend API key configured
- [ ] Domain verified in Resend
- [ ] Test order placed email
- [ ] Test order confirmed email
- [ ] Test payment verified email
- [ ] Admin can confirm orders
- [ ] Admin can verify payments
- [ ] Status colors displaying correctly
- [ ] All email templates rendering properly
- [ ] Mobile responsive email templates tested

---

## 📞 Support

For issues or questions:
- Check console logs for error messages
- Review Resend dashboard for email delivery status
- Verify database status values match expected values

**Last Updated:** October 16, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

