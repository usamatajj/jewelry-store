# ⚡ Quick Setup Reference - Checkout Update

## 🎯 What You Need to Do

Just **3 steps** to get started:

---

## 1️⃣ Run This SQL (in Supabase SQL Editor)

```sql
-- Add columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_screenshot text NULL,
ADD COLUMN IF NOT EXISTS phone text NULL;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT DO NOTHING;

-- Set up storage policies (allows guest uploads for guest checkout)
CREATE POLICY IF NOT EXISTS "Allow guest payment uploads"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY IF NOT EXISTS "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-screenshots');

CREATE POLICY IF NOT EXISTS "Allow admin all"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

---

## 2️⃣ Update Bank Details

Edit `src/app/checkout/page.tsx` (line ~655):

```typescript
<p><strong>Bank:</strong> YOUR_BANK_NAME</p>
<p><strong>Account Title:</strong> YOUR_BUSINESS_NAME</p>
<p><strong>Account Number:</strong> YOUR_ACCOUNT_NUMBER</p>
<p><strong>IBAN:</strong> YOUR_IBAN</p>
```

---

## 3️⃣ Test & Deploy

```bash
# Test locally
npm run dev

# Push to Git
git add .
git commit -m "Add bank transfer and COD payment options"
git push origin main

# Vercel will auto-deploy
```

---

## ✅ What You Get

### Payment Options:

- 💳 **Bank Transfer** - Upload payment screenshot
- 💰 **Cash on Delivery** - Rs 100 charges

### Features:

- ✅ **Guest Checkout** - No login required!
- ✅ No license agreement checkboxes
- ✅ Proper delivery address handling
- ✅ Phone number capture
- ✅ Email confirmations
- ✅ Payment screenshot storage

### Pricing:

- **Shipping**: Free above Rs 5,000, else Rs 200
- **COD**: Additional Rs 100
- **Currency**: PKR (Rs)

---

## 📋 Quick Test

1. Add product to cart
2. Go to `/checkout`
3. Fill form
4. Select "Bank Transfer"
5. Upload screenshot
6. Submit
7. ✅ Check Supabase orders table
8. ✅ Check payment-screenshots bucket

---

## 🆘 Quick Troubleshooting

| Error                | Fix                    |
| -------------------- | ---------------------- |
| Column doesn't exist | Run SQL from Step 1    |
| Permission denied    | Check storage policies |
| Image not configured | Restart dev server     |
| Upload fails         | Check file size < 5MB  |

---

## 📚 Full Documentation

- `COMPLETE_SETUP_STEPS.md` - Detailed step-by-step guide
- `PAYMENT_SCREENSHOT_STORAGE_SETUP.md` - Storage configuration
- `CHECKOUT_UPDATE_SUMMARY.md` - Feature overview

---

**That's it!** 🎉
