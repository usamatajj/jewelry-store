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

- Additional Rs 100 charges
- Payment status: `pending` until delivery
- No screenshot required
- Terms and conditions displayed

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

```typescript
subtotal = items.reduce((sum, item) => sum + price * quantity, 0);
shipping = subtotal >= 5000 ? 0 : 200;
codCharges = paymentMethod === 'cash_on_delivery' ? 100 : 0;
tax = 0;
total = subtotal + shipping + tax + codCharges;
```

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

- [ ] Bank transfer with screenshot
- [ ] Bank transfer without screenshot (should fail)
- [ ] COD with Rs 100 charges
- [ ] Separate delivery address
- [ ] Same delivery address
- [ ] Free shipping above Rs 5000
- [ ] Paid shipping below Rs 5000
- [ ] Email confirmation sent
- [ ] Screenshot uploaded to storage
- [ ] Order created in database
- [ ] Order items created
- [ ] Success page displayed

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

- `COMPLETE_SETUP_STEPS.md` - Setup guide
- `PAYMENT_SCREENSHOT_STORAGE_SETUP.md` - Storage details
- `CHECKOUT_UPDATE_SUMMARY.md` - Feature summary
- `QUICK_SETUP_REFERENCE.md` - Quick start

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

---

**Last Updated**: October 4, 2025  
**Maintained by**: Development Team  
**Status**: Production Ready
