# Supabase Storage Configuration Guide

This document provides a comprehensive guide to the Supabase Storage setup for the jewelry store's image upload system.

## 📁 Storage Bucket Configuration

### Bucket Name

```
product-images
```

### Bucket Settings

- **Public**: Yes (allows direct access to images via public URLs)
- **File Size Limit**: 5MB per file
- **Allowed File Types**: PNG, JPG, JPEG, WEBP
- **Max Files per Product**: 5 images

## 🗂️ File Organization Structure

### Directory Pattern

```
product-images/
├── products/
│   └── {product-id}/
│       ├── {timestamp}-{random-id}.{extension}
│       ├── {timestamp}-{random-id}.{extension}
│       └── ...
└── temp/
    ├── {timestamp}-{random-id}.{extension}
    ├── {timestamp}-{random-id}.{extension}
    └── ...
```

### File Naming Convention

#### Product Images (Final Location)

```
Format: {timestamp}-{random-id}.{extension}
Example: 1759007267703-fcr3ksb9wjj.png

Components:
- {timestamp}: Unix timestamp in milliseconds (ensures uniqueness)
- {random-id}: 13-character random string (Math.random().toString(36).substring(2, 15))
- {extension}: Original file extension (png, jpg, jpeg, webp)
```

#### Temporary Images (During Upload)

```
Format: {timestamp}-{random-id}.{extension}
Example: 1759007267703-fcr3ksb9wjj.png

Location: products/temp/
Purpose: Temporary storage before product creation
```

## 🔐 Storage Policies

### Bucket Policies

#### 1. Public Access (Select)

```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
```

#### 2. Authenticated Upload (Insert)

```sql
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

#### 3. Authenticated Update (Update)

```sql
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

#### 4. Authenticated Delete (Delete)

```sql
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);
```

## 📤 Upload Workflow

### 1. New Product Creation

```
1. User selects images → Stored locally with preview
2. Form submission → Images uploaded to products/temp/
3. Product created in database → Images moved to products/{product-id}/
4. Temp files cleaned up
```

### 2. Existing Product Update

```
1. User selects new images → Stored locally with preview
2. Form submission → New images uploaded directly to products/{product-id}/
3. Product updated in database with new image URLs
4. No temp folder used for existing products
```

## 🔗 Public URL Generation

### URL Format

```
https://{project-ref}.supabase.co/storage/v1/object/public/{bucket-name}/{file-path}

Example:
https://jjnzylvhvksigqlcapbs.supabase.co/storage/v1/object/public/product-images/products/131f7ecd-3fc3-4e42-a926-849b64c99a86/1759007267703-fcr3ksb9wjj.png
```

### URL Components

- `{project-ref}`: Your Supabase project reference
- `{bucket-name}`: `product-images`
- `{file-path}`: `products/{product-id}/{filename}`

## 🗃️ Database Integration

### Products Table Schema

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  images TEXT[] NOT NULL, -- Array of public URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Image URL Storage

- **Column**: `images` (TEXT[])
- **Content**: Array of public URLs from Supabase Storage
- **First Image**: Used as primary product image
- **Constraint**: Must contain at least one image

## 🛠️ Storage Utility Functions

### Upload Function

```typescript
uploadProductImages(files: File[], productId?: string): Promise<UploadResult[]>
```

**Parameters:**

- `files`: Array of File objects to upload
- `productId`: Optional product ID for existing products

**Returns:**

- Array of `UploadResult` with `url` and `path`

### File Organization Logic

```typescript
// For new products
const fileName = `products/temp/${timestamp}-${randomId}.${extension}`;

// For existing products
const fileName = `products/${productId}/${timestamp}-${randomId}.${extension}`;
```

## 🔍 File Management Operations

### Move Temporary Files

```typescript
moveTempImagesToProduct(tempPaths: string[], productId: string): Promise<string[]>
```

**Process:**

1. Copy files from `products/temp/` to `products/{productId}/`
2. Delete original temp files
3. Return new public URLs

### Delete Product Images

```typescript
deleteProductImages(paths: string[]): Promise<void>
```

**Usage:** Clean up images when products are deleted

## 📱 Frontend Integration

### Next.js Image Configuration

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '{project-ref}.supabase.co',
      port: '',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

### Image Display

```typescript
// ProductCard component
<Image
  src={product.images[0]} // First image as primary
  alt={product.name}
  fill
  className="object-cover"
/>
```

## 🚀 Best Practices

### 1. File Naming

- ✅ Use timestamps for uniqueness
- ✅ Include random IDs for collision prevention
- ✅ Preserve original file extensions
- ❌ Don't use user-provided filenames (security risk)

### 2. Organization

- ✅ Group images by product ID
- ✅ Use temporary folder for new products
- ✅ Clean up temporary files after processing
- ❌ Don't store all images in root bucket

### 3. Security

- ✅ Require authentication for uploads
- ✅ Validate file types and sizes
- ✅ Use public bucket for read access
- ❌ Don't allow anonymous uploads

### 4. Performance

- ✅ Compress images before upload
- ✅ Use appropriate image formats (WebP preferred)
- ✅ Implement image optimization
- ❌ Don't upload oversized files

## 🔧 Troubleshooting

### Common Issues

#### 1. Upload Failures

- Check file size (must be ≤ 5MB)
- Verify file type (PNG, JPG, JPEG, WEBP only)
- Ensure user is authenticated

#### 2. Image Not Displaying

- Verify public URL is correct
- Check Next.js image configuration
- Ensure bucket is public

#### 3. Permission Errors

- Verify RLS policies are correctly set
- Check user authentication status
- Ensure bucket policies allow operations

### Debug Commands

```sql
-- Check bucket policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- List bucket contents
SELECT name, bucket_id FROM storage.objects WHERE bucket_id = 'product-images';

-- Check file sizes
SELECT name, metadata->>'size' as size FROM storage.objects WHERE bucket_id = 'product-images';
```

## 📊 Storage Monitoring

### Key Metrics to Track

- Total storage used
- Number of files uploaded
- Average file size
- Storage costs
- Upload success rate

### Supabase Dashboard

Access storage metrics in:

```
Supabase Dashboard → Storage → product-images bucket → Settings → Metrics
```

## 🔄 Migration Considerations

### Moving from image_url to images array

1. **Backup existing data**
2. **Run migration script** to populate images array
3. **Update application code**
4. **Remove image_url column**
5. **Test thoroughly**

### Example Migration Script

```sql
-- Populate images array from image_url
UPDATE products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Add constraint
ALTER TABLE products ADD CONSTRAINT products_must_have_images
CHECK (array_length(images, 1) > 0);

-- Remove old column
ALTER TABLE products DROP COLUMN image_url;
```

This storage configuration provides a robust, scalable solution for managing product images in your jewelry store! 💎✨
