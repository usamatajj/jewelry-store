# Admin Setup Guide

## Hardcoded Admin User

The jewelry store comes with a pre-configured admin user for easy access to the admin panel.

### Admin Credentials

- **Email**: Set via `NEXT_PUBLIC_ADMIN_EMAIL` environment variable
- **Password**: Set via `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable

### How to Set Up the Admin User

1. **Set up environment variables**:

   - Create a `.env.local` file in your project root
   - Add the following variables:
     ```
     NEXT_PUBLIC_ADMIN_EMAIL=your-admin@email.com
     NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
     ```

2. **Create the user in Supabase Auth**:

   - Go to your Supabase Dashboard
   - Navigate to Authentication > Users
   - Click "Add user" or "Invite user"
   - Enter email: Use your `NEXT_PUBLIC_ADMIN_EMAIL` value
   - Enter password: Use your `NEXT_PUBLIC_ADMIN_PASSWORD` value
   - Click "Create user"

3. **Update the users table**:

   - Run the updated `supabase-schema.sql` file in your Supabase SQL Editor
   - **Important**: Replace `'admin@jewelrystore.com'` in the SQL with your actual `NEXT_PUBLIC_ADMIN_EMAIL` value
   - This will create the admin user record with the correct role

4. **Access the Admin Panel**:
   - Go to `/admin/login` in your browser
   - Use your configured credentials to sign in
   - You'll be redirected to the full admin dashboard

### Admin Panel Features

The admin panel provides full CRUD access to:

#### Products Management

- ✅ **Create** new products with name, description, price, category, and multiple images
- ✅ **Read** all products with search and filtering
- ✅ **Update** existing product details and images
- ✅ **Delete** products (with confirmation)
- ✅ **View** product images and details
- ✅ **Multiple Image Upload** with drag & drop functionality
- ✅ **Image Preview** before upload
- ✅ **Supabase Storage Integration** for secure image hosting

#### Categories Management

- ✅ **Create** new categories and subcategories
- ✅ **Read** all categories with hierarchical display
- ✅ **Update** category names and parent relationships
- ✅ **Delete** categories (and all associated products)

#### Orders Management

- ✅ **View** all customer orders
- ✅ **Track** order status and details
- ✅ **Monitor** revenue and sales data

#### Users Management

- ✅ **View** all registered users
- ✅ **See** user roles and registration dates
- ✅ **Monitor** user activity

#### Dashboard Analytics

- ✅ **Total Products** count
- ✅ **Total Categories** count
- ✅ **Total Orders** count
- ✅ **Revenue** tracking
- ✅ **Real-time** statistics

### Security Features

- **Role-based Access**: Only users with `role = 'admin'` can access the admin panel
- **Authentication Required**: Must be signed in to access admin features
- **Secure Redirects**: Non-admin users are redirected to the main store
- **Confirmation Dialogs**: Delete operations require confirmation
- **Row Level Security**: Database operations are secured with RLS policies
- **Image Upload Security**: Files are validated and stored securely in Supabase Storage

### Quick Start

1. Set up the admin user in Supabase (steps above)
2. Run the schema to create the admin record
3. Visit `/admin/login` and sign in
4. Start managing your jewelry store!

### Troubleshooting

**If you can't access the admin panel:**

- Ensure the admin user exists in Supabase Auth with your `NEXT_PUBLIC_ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_PASSWORD`
- Check that the user record exists in the `users` table with `role = 'admin'`
- Verify your environment variables are set correctly in `.env.local`
- Check the browser console for any error messages

**If the admin user doesn't have the right permissions:**

- Update the user record in the `users` table: `UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';`

### Image Upload System

The admin panel includes a comprehensive image upload system:

#### Features

- **Mandatory Image Upload**: At least one image is required for each product
- **Multiple Image Support**: Upload up to 5 images per product
- **Drag & Drop Interface**: Easy file selection with visual feedback
- **Image Preview**: See images before upload with thumbnails
- **File Validation**: Automatic validation of file types and sizes (5MB limit)
- **Supabase Storage**: Images stored securely in Supabase Storage
- **Organized Storage**: Images organized in `products/{productId}/` folders
- **Database Integration**: Image URLs automatically saved to `images` array column

#### How It Works

1. **Select Images**: Drag & drop or click to browse for image files
2. **Preview**: Images show as thumbnails immediately (stored locally)
3. **Upload**: Images upload to Supabase Storage only when form is submitted
4. **Database Update**: Image URLs are saved to the product record
5. **Display**: Images are accessible via public URLs for display

#### Storage Structure

```
product-images/
├── products/
│   └── {product-id}/
│       ├── image1.jpg
│       ├── image2.png
│       └── ...
```

#### Database Schema

The `products` table includes:

- `images`: Array of image URLs for the product (required, must have at least one image)
- The first image in the array is used as the primary product image

### Customization

You can modify the admin credentials by:

1. Updating the `NEXT_PUBLIC_ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_PASSWORD` in your `.env.local` file
2. Creating a new user in Supabase Auth with your preferred credentials
3. Updating the `users` table record accordingly

The admin system is fully functional and ready to use! 🎉
