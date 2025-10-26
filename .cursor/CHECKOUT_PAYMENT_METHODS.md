# Checkout Payment Methods Configuration

## 📌 Overview

The checkout system has been updated to support Pakistani payment methods with proper handling of payment screenshots and delivery addresses.

## 💳 Payment Methods

### 1. Bank Transfer

- Customer uploads payment screenshot (mandatory)
- Screenshot stored in Supabase Storage
- Payment status: `pending` until admin verifies
- Bank details displayed on checkout page

### 2. Cash on Delivery (COD)

#### COD Charges:
- **Rs 200 Shipping** (always, no free shipping for COD)

#### Formula:
```
Shipping = Rs 200 (always for COD)
Total = Subtotal + Rs 200
```

#### Example:
For an Rs 8,000 order:
- Subtotal: Rs 8,000
- Shipping: Rs 200
- Order Total: Rs 8,200

#### Key Points:
- Payment status: `pending` until delivery
- No screenshot required
- No maximum order limit
- COD available for all order amounts
- Rs 200 flat shipping fee for all COD orders

## 🗄️ Database Schema

### New Columns Added:

```sql
orders.payment_screenshot TEXT NULL  -- URL to uploaded screenshot
orders.phone TEXT NULL               -- Customer contact number
```

### Payment Methods Enum:

- `bank_transfer`
- `cash_on_delivery`

### Payment Status Values:

- `pending` - Awaiting verification/payment
- `paid` - Payment confirmed
- `failed` - Payment failed
- `refunded` - Payment refunded

## 📁 File Structure

```
src/
├── app/
│   ├── checkout/
│   │   └── page.tsx              # Checkout form with payment options
│   └── api/
│       └── orders/
│           └── route.ts          # Order creation API
├── components/
│   └── ui/
│       └── radio-group.tsx       # Radio button component
├── lib/
│   └── storage.ts                # Payment screenshot upload utilities
└── types/
    └── index.ts                  # CheckoutForm interface
```

## 🔧 Key Functions

### Storage Functions (`src/lib/storage.ts`):

```typescript
// Upload payment screenshot
uploadPaymentScreenshot(file: File, orderId?: string): Promise<UploadResult>

// Move temp screenshot to order folder
movePaymentScreenshotToOrder(tempPath: string, orderId: string): Promise<string>

// Delete payment screenshot
deletePaymentScreenshot(path: string): Promise<void>
```

### File Naming Pattern:

```
/payment-screenshots/
  └── orders/
      └── {order-id}/
          └── payment-{timestamp}.{ext}
```

## 🎨 UI Components

### Payment Method Cards:

- Bank Transfer card with account details
- COD card with charges and terms
- Visual feedback on selection
- Conditional field display

### Bank Account Details Display:

```typescript
Bank: HBL Bank
Account Title: Eterna Jewels
Account Number: 1234567890123
IBAN: PK12HABB1234567890123456
```

## 📋 Form Validation

### Required Fields:

- Personal: firstName, lastName, email, phone
- Billing: address, city, state, zipCode, country
- Payment: paymentMethod
- Bank Transfer: paymentScreenshot (file upload)

### Conditional Validation:

- If `useDifferentDelivery`: All delivery fields required
- If `bank_transfer`: Screenshot mandatory
- If `cash_on_delivery`: No additional fields

## 💰 Pricing Logic

### Current Implementation:

```typescript
// Calculate subtotal
subtotal = items.reduce((sum, item) => sum + price * quantity, 0);

// Shipping logic: Free above Rs 5000 for bank transfer, always Rs 200 for COD
shipping = paymentMethod === 'cash_on_delivery'
  ? 200  // COD always pays shipping
  : subtotal >= 5000
    ? 0   // Bank transfer gets free shipping above Rs 5000
    : 200;

// Calculate total
total = subtotal + shipping;
```

## 📦 Shipping Policy

### Bank Transfer:
- ✅ **Free shipping** on orders above Rs 5,000
- 💰 Rs 200 shipping for orders below Rs 5,000

### Cash on Delivery (COD):
- 💰 **Always Rs 200 shipping** (no free shipping for COD)

### Rationale:
COD orders involve additional operational costs:
- Cash handling at delivery
- Higher delivery risk
- Potential return shipping costs
- Payment verification delays

Therefore, free shipping is only available for bank transfer orders above Rs 5,000.

## 💵 Pricing Examples

### Example 1: Small Order (Rs 3,000)

**Bank Transfer:**
- Subtotal: Rs 3,000
- Shipping: Rs 200
- **Total: Rs 3,200**

**Cash on Delivery:**
- Subtotal: Rs 3,000
- Shipping: Rs 200
- **Total: Rs 3,200**

### Example 2: Medium Order (Rs 8,000)

**Bank Transfer:**
- Subtotal: Rs 8,000
- Shipping: Rs 0 (free above Rs 5,000)
- **Total: Rs 8,000**

**Cash on Delivery:**
- Subtotal: Rs 8,000
- Shipping: Rs 200 (COD always pays)
- **Total: Rs 8,200**
- **Difference: Rs 200 more than bank transfer**

### Example 3: Large Order (Rs 15,000)

**Bank Transfer:**
- Subtotal: Rs 15,000
- Shipping: Rs 0 (free above Rs 5,000)
- **Total: Rs 15,000**

**Cash on Delivery:**
- Subtotal: Rs 15,000
- Shipping: Rs 200 (COD always pays)
- **Total: Rs 15,200**
- **Difference: Rs 200 more than bank transfer**

### Summary Table:

| Order Amount | Bank Transfer | COD Total | Additional COD Cost |
|--------------|---------------|-----------|---------------------|
| Rs 3,000 | Rs 3,200 | Rs 3,200 | +Rs 0 |
| Rs 5,000 | Rs 5,000 | Rs 5,200 | +Rs 200 |
| Rs 8,000 | Rs 8,000 | Rs 8,200 | +Rs 200 |
| Rs 10,000 | Rs 10,000 | Rs 10,200 | +Rs 200 |
| Rs 15,000 | Rs 15,000 | Rs 15,200 | +Rs 200 |
| Rs 50,000 | Rs 50,000 | Rs 50,200 | +Rs 200 |

## 📧 Email Confirmation

### Sent After Order:

- Order number
- Items list
- Total amount
- Delivery address
- Payment method specific instructions

### Payment Method Messaging:

- **Bank Transfer**: "We'll verify your payment within 24 hours"
- **COD**: "Prepare exact cash for delivery"

## 🔒 Security

### File Upload:

- Max size: 5MB
- Allowed types: Images only
- Client-side validation
- Stored in private bucket

### Storage Bucket:

- Name: `payment-screenshots`
- Public: No (private)
- RLS policies: Authenticated users only

### RLS Policies:

1. Authenticated users can upload
2. Authenticated users can view
3. Admins can update/delete

## 🚀 Order Creation Flow

1. User fills checkout form
2. Selects payment method
3. If bank transfer: Uploads screenshot
4. Form validated
5. Screenshot uploaded to temp folder
6. Order created in database
7. Screenshot moved to order folder
8. Order items created
9. Email sent
10. Cart cleared
11. Success page shown

## 📊 Order Status Flow

```
Created → Pending → Processing → Shipped → Delivered
          ↓
       Cancelled
```

Payment Status:

```
Pending → Paid (bank transfer after verification)
Pending → Paid (COD after delivery)
```

## 🎯 Admin Tasks

### Payment Screenshot Verification:

1. View uploaded screenshot
2. Verify payment matches order
3. Update payment_status to 'paid'
4. Update order status to 'processing'

### COD Orders:

1. Confirm order via phone
2. Prepare items
3. Ship with COD instructions
4. Update payment_status after delivery

## 🔍 Testing Checklist

### Bank Transfer Tests:
- [ ] Bank transfer with screenshot (should succeed)
- [ ] Bank transfer without screenshot (should fail)
- [ ] Order below Rs 5,000 with Rs 200 shipping
- [ ] Order above Rs 5,000 with free shipping
- [ ] Screenshot uploaded to storage correctly
- [ ] Payment status set to 'pending'

### COD Tests:
- [ ] COD order below Rs 5,000 (Rs 200 shipping + COD charges)
- [ ] COD order above Rs 5,000 (Rs 200 shipping + COD charges, NO free shipping)
- [ ] COD charges calculated correctly (subtotal × 4.5% + Rs 100)
- [ ] Payment status set to 'pending'
- [ ] COD terms displayed at checkout

### General Tests:
- [ ] Separate delivery address works
- [ ] Same delivery address (billing = delivery)
- [ ] Email confirmation sent
- [ ] Order created in database
- [ ] Order items created
- [ ] Success page displayed
- [ ] Cart cleared after order

### Edge Cases:
- [ ] COD order exactly Rs 5,000 (should pay shipping)
- [ ] COD order Rs 10,000+ (should still pay shipping)
- [ ] Guest checkout works
- [ ] Logged-in user checkout works

## 📱 Mobile Considerations

- Responsive layout
- Touch-friendly buttons
- File upload works on mobile
- Camera access for screenshots
- Keyboard navigation

## 🔄 Future Enhancements

### Admin Panel:

- [ ] View payment screenshots
- [ ] Bulk payment verification
- [ ] Download receipts
- [ ] Payment status updater
- [ ] Order status tracker

### Customer Features:

- [ ] Order tracking
- [ ] Reorder functionality
- [ ] Cancel order (if unpaid)
- [ ] Payment reminder emails
- [ ] Delivery notifications

## 📚 Related Files

- `PAYMENT_SCREENSHOT_STORAGE_SETUP.md` - Storage setup details
- `QUICK_SETUP_REFERENCE.md` - Quick start guide
- `src/app/checkout/page.tsx` - Checkout implementation
- `src/app/api/orders/route.ts` - Order API

## 🆘 Common Issues

### "Column does not exist"

Run database migration in `schema-update-orders.sql`

### "Permission denied for bucket"

Set up storage RLS policies

### "File upload fails"

- Check file size < 5MB
- Verify file type is image
- Check bucket exists
- Verify policies

### "Order creation fails"

- Check all required fields
- Verify user authentication
- Check RLS policies on orders table

## 📝 Changelog

### Version 2.1 (October 2025)
- ✅ Updated shipping policy: COD orders always pay Rs 200 shipping
- ✅ Free shipping only for bank transfer orders above Rs 5,000
- ✅ Added comprehensive pricing examples
- ✅ Updated all documentation to reflect shipping changes

### Version 2.0 (October 2025)
- ✅ Removed COD limit: COD available for all order amounts
- ✅ Added COD policy banner at checkout
- ✅ Simplified user experience

### Version 1.0 (October 2025)
- ✅ Initial implementation
- ✅ Bank transfer with screenshot upload
- ✅ COD with 4.5% + Rs 100 charges
- ✅ Guest checkout support

---

**Last Updated**: October 16, 2025  
**Maintained by**: Development Team  
**Status**: Production Ready ✅
