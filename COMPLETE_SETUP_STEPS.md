# 🚀 Complete Setup Steps for Checkout Update

## Step-by-Step Guide

Follow these steps **in order** to set up the new checkout system.

---

## 📋 Step 1: Update Database Schema

### Run this SQL in Supabase SQL Editor:

```sql
-- 1. Add payment_screenshot column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_screenshot text NULL;

COMMENT ON COLUMN public.orders.payment_screenshot
IS 'URL/path to uploaded bank transfer screenshot';

-- 2. Add phone column (if it doesn't exist)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS phone text NULL;

COMMENT ON COLUMN public.orders.phone
IS 'Customer phone number for order contact';

-- 3. Verify columns added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('payment_screenshot', 'phone');
```

**Expected Output:**

```
column_name         | data_type | is_nullable
--------------------|-----------|------------
payment_screenshot  | text      | YES
phone              | text      | YES
```

---

## 🗄️ Step 2: Create Storage Bucket

### Option A: Via Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in left sidebar
4. Click **"Create a new bucket"**
5. Enter details:
   - **Name**: `payment-screenshots`
   - **Public**: ❌ **UNCHECKED** (keep private)
6. Click **"Create bucket"**

### Option B: Via SQL

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false);
```

---

## 🔐 Step 3: Set Up Storage Policies

### Run this SQL in Supabase SQL Editor:

```sql
-- Policy 1: Allow authenticated users to upload screenshots
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots'
);

-- Policy 2: Allow authenticated users to view screenshots
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots'
);

-- Policy 3: Allow admins to update screenshots
CREATE POLICY "Allow admin updates"
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

-- Policy 4: Allow admins to delete screenshots
CREATE POLICY "Allow admin deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

**Verify Policies:**

```sql
SELECT * FROM storage.policies
WHERE bucket_id = 'payment-screenshots';
```

---

## 🔧 Step 4: Update Next.js Configuration (Already Done)

The `next.config.ts` should already include Supabase storage domain. Verify:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'jjnzylvhvksigqlcapbs.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

---

## 💳 Step 5: Update Bank Details (IMPORTANT)

Edit `src/app/checkout/page.tsx` around **line 655** with your actual bank details:

```typescript
<div className="text-sm space-y-1">
  <p>
    <strong>Bank:</strong> YOUR_BANK_NAME
  </p>
  <p>
    <strong>Account Title:</strong> YOUR_BUSINESS_NAME
  </p>
  <p>
    <strong>Account Number:</strong> YOUR_ACCOUNT_NUMBER
  </p>
  <p>
    <strong>IBAN:</strong> YOUR_IBAN
  </p>
</div>
```

---

## ✅ Step 6: Test the Setup

### Test 1: Database

```sql
-- Test inserting a test order with new columns
INSERT INTO orders (
  email, first_name, last_name, phone,
  address, city, state, zip_code, country,
  total_amount, payment_method, payment_screenshot
) VALUES (
  'test@example.com', 'Test', 'User', '+92 300 1234567',
  'Test Address', 'Karachi', 'Sindh', '12345', 'Pakistan',
  1000, 'bank_transfer', 'https://example.com/screenshot.jpg'
);

-- Verify
SELECT id, phone, payment_method, payment_screenshot
FROM orders
WHERE email = 'test@example.com';

-- Clean up
DELETE FROM orders WHERE email = 'test@example.com';
```

### Test 2: Storage Upload

1. Go to Supabase Dashboard → Storage → `payment-screenshots`
2. Click **"Upload file"**
3. Try uploading a test image
4. If successful, delete it

### Test 3: Application Flow (Local)

**Start development server:**

```bash
npm run dev
```

**Test Bank Transfer:**

1. Add product to cart
2. Go to checkout
3. Fill all fields
4. Select "Bank Transfer"
5. Upload a screenshot
6. Submit order
7. Check success page
8. Verify in Supabase:
   - Order created in `orders` table
   - Screenshot in `payment-screenshots` bucket
   - `payment_screenshot` URL saved

**Test COD:**

1. Add product to cart
2. Go to checkout
3. Fill all fields
4. Select "Cash on Delivery"
5. See Rs 100 added
6. Submit order
7. Check success page

---

## 🚀 Step 7: Deploy to Production

### Push to Git:

```bash
git add .
git commit -m "Update checkout with bank transfer and COD options"
git push origin main
```

### Vercel Auto-Deploy:

- Vercel will automatically deploy from your `main` branch
- Check deployment status at https://vercel.com/dashboard

### Or Manual Deploy:

```bash
vercel --prod
```

---

## 🧪 Step 8: Test on Production

After deployment:

1. ✅ Visit production URL
2. ✅ Add product to cart
3. ✅ Complete bank transfer checkout
4. ✅ Verify screenshot uploaded
5. ✅ Check email received
6. ✅ Complete COD checkout
7. ✅ Test separate delivery address

---

## 🐛 Troubleshooting

### Issue: "payment_screenshot column does not exist"

**Solution:** Run Step 1 SQL migration

### Issue: "Permission denied for bucket"

**Solution:**

- Verify bucket exists
- Run Step 3 storage policies
- Check user is authenticated

### Issue: "new row violates row-level security policy"

**Solution:**

```sql
-- Check RLS is enabled on orders
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'orders';

-- If RLS is enabled, verify policies exist
SELECT * FROM pg_policies
WHERE tablename = 'orders';
```

### Issue: "Invalid src prop ... hostname not configured"

**Solution:**

- Verify `next.config.ts` includes Supabase domain
- Restart dev server
- Redeploy to production

### Issue: "File upload fails"

**Solution:**

- Check file size (< 5MB)
- Check file type (image only)
- Verify storage bucket exists
- Check storage policies

---

## 📊 Verify Everything Works

### Checklist:

- [ ] Database columns added
- [ ] Storage bucket created
- [ ] Storage policies set up
- [ ] Bank details updated
- [ ] Local testing successful (bank transfer)
- [ ] Local testing successful (COD)
- [ ] Local testing successful (delivery address)
- [ ] Email confirmation received
- [ ] Code pushed to Git
- [ ] Deployed to production
- [ ] Production testing successful
- [ ] Mobile testing done

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for errors
3. Check Network tab for failed API calls
4. Review `PAYMENT_SCREENSHOT_STORAGE_SETUP.md` for detailed storage setup
5. Review `CHECKOUT_UPDATE_SUMMARY.md` for feature details

---

## 🎉 You're Done!

Once all steps are complete and tested, your checkout system is ready to accept:

- ✅ Bank Transfer payments with screenshot
- ✅ Cash on Delivery orders
- ✅ Proper delivery address handling
- ✅ Email confirmations

**Next**: Consider updating the admin panel to view payment screenshots and update order statuses!

---

**Last Updated**: October 4, 2025  
**Version**: 1.0
