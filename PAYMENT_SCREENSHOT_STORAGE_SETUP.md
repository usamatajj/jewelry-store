# Payment Screenshot Storage Setup Guide

## 📋 Overview

This guide will help you set up Supabase Storage for payment screenshot uploads during checkout.

## 🗄️ Step 1: Create Storage Bucket

### Via Supabase Dashboard

1. **Open Supabase Dashboard**

   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**

   - Click on **Storage** in the left sidebar
   - Click **"Create a new bucket"**

3. **Create Bucket**
   - **Name**: `payment-screenshots`
   - **Public bucket**: ❌ **UNCHECKED** (Keep private for security)
   - Click **"Create bucket"**

### Via SQL (Alternative)

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false);
```

## 🔐 Step 2: Set Up Storage Policies

### Option A: Via Dashboard (Recommended)

1. **Go to Storage → payment-screenshots bucket**
2. Click on **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Allow Upload (INSERT)

- **Policy Name**: `Allow authenticated users to upload screenshots`
- **Allowed Operation**: INSERT
- **Target Roles**: `authenticated`
- **Policy Definition**:
  ```sql
  (bucket_id = 'payment-screenshots'::text)
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 2: Allow Read (SELECT)

- **Policy Name**: `Allow authenticated users to view their screenshots`
- **Allowed Operation**: SELECT
- **Target Roles**: `authenticated`
- **Policy Definition**:
  ```sql
  (bucket_id = 'payment-screenshots'::text)
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 3: Allow Admin Access (ALL)

- **Policy Name**: `Allow admins full access`
- **Allowed Operation**: ALL
- **Target Roles**: `authenticated`
- **Policy Definition**:
  ```sql
  (
    (bucket_id = 'payment-screenshots'::text)
    AND
    (
      (auth.uid() IN (
        SELECT users.id FROM users
        WHERE users.role = 'admin'::text
      ))
    )
  )
  ```
- Click **"Review"** then **"Save policy"**

### Option B: Via SQL

Copy and run this in **SQL Editor**:

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots'
);

-- Policy 2: Allow authenticated users to read
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots'
);

-- Policy 3: Allow admins to update
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

-- Policy 4: Allow admins to delete
CREATE POLICY "Allow admin deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

## 📝 Step 3: Update Database Schema

Run this SQL to add the `payment_screenshot` column:

```sql
-- Add column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_screenshot text NULL;

-- Add comment
COMMENT ON COLUMN public.orders.payment_screenshot
IS 'URL/path to uploaded bank transfer screenshot';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'payment_screenshot';
```

## 🔧 Step 4: Update Next.js Configuration

Add the Supabase storage domain to `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'jjnzylvhvksigqlcapbs.supabase.co', // Your Supabase project
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
```

## 📂 Step 5: File Naming Convention

Payment screenshots will be stored with this pattern:

```
/payment-screenshots/
  └── orders/
      └── {order-id}/
          └── payment-{timestamp}.{ext}

Example:
/payment-screenshots/orders/a1b2c3d4-e5f6/payment-1704123456789.jpg
```

## 🔍 Step 6: Verify Setup

### Test Upload (Via Dashboard)

1. Go to **Storage → payment-screenshots**
2. Click **"Upload file"**
3. Try uploading a test image
4. If successful, you can see the file listed
5. Try to get the public URL (it should require authentication)

### Check Policies

```sql
-- List all policies for the bucket
SELECT * FROM storage.policies
WHERE bucket_id = 'payment-screenshots';

-- Check if bucket exists
SELECT * FROM storage.buckets
WHERE id = 'payment-screenshots';
```

## 📊 Storage Limits

### Free Tier

- **Storage**: 1 GB
- **Bandwidth**: 2 GB
- **Files**: Unlimited

### Recommendations

- Compress images before upload
- Max file size: 5 MB per screenshot
- Supported formats: JPG, PNG, WEBP
- Clean up old screenshots periodically

## 🔒 Security Best Practices

### 1. Private Bucket

- ✅ Keep bucket private (not public)
- ✅ Use RLS policies for access control
- ✅ Only authenticated users can upload

### 2. File Validation

- ✅ Validate file type (images only)
- ✅ Validate file size (max 5MB)
- ✅ Sanitize file names
- ✅ Generate unique file names

### 3. Admin Access

- ✅ Only admins can view all screenshots
- ✅ Users can only upload, not delete
- ✅ Track who uploaded what

## 🛠️ Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution**: Make sure you're authenticated and policies are set correctly.

```sql
-- Check if user is authenticated
SELECT auth.uid();

-- Check user role
SELECT role FROM users WHERE id = auth.uid();
```

### Issue: "Permission denied for bucket"

**Solution**: Verify bucket policies:

```sql
-- List all policies
SELECT * FROM storage.policies;

-- Re-create policies if needed
-- (Run the SQL from Step 2)
```

### Issue: Upload fails with CORS error

**Solution**: Check allowed origins in Supabase settings:

1. Go to **Settings → API**
2. Add your domain to allowed origins
3. Include `http://localhost:3001` for local development

## ✅ Verification Checklist

Before going live, verify:

- [ ] Bucket `payment-screenshots` exists
- [ ] Bucket is **private** (not public)
- [ ] Upload policy is active
- [ ] Read policy is active
- [ ] Admin policies are active
- [ ] `payment_screenshot` column exists in `orders` table
- [ ] Next.js config includes Supabase domain
- [ ] Test upload works from your app
- [ ] Test file appears in Supabase Storage
- [ ] Order saves with screenshot URL

## 🎯 Expected Results

After setup, you should be able to:

1. ✅ User selects "Bank Transfer" at checkout
2. ✅ User uploads payment screenshot
3. ✅ File uploads to `/payment-screenshots/orders/{order-id}/`
4. ✅ URL is saved in `orders.payment_screenshot`
5. ✅ Admin can view screenshot in admin panel
6. ✅ Order confirmation email includes payment status

## 📧 Next Steps

After storage setup:

1. ✅ Test the checkout flow
2. ✅ Verify file uploads
3. ✅ Check order saves correctly
4. ✅ Test email confirmation
5. ✅ Update admin panel to show screenshots
6. ✅ Deploy to production

## 🔗 Related Documentation

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js Image Configuration](https://nextjs.org/docs/app/api-reference/components/image)

---

**Need Help?** Check the Supabase dashboard logs or console for detailed error messages.
