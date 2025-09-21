# Jewelry Store - Next.js E-commerce Application

A modern, responsive jewelry e-commerce store built with Next.js, Supabase, and shadcn/ui.

## Features

- 🛍️ **Complete E-commerce Storefront**

  - Product catalog with categories and subcategories
  - Individual product pages with detailed information
  - Shopping cart functionality
  - Checkout process with form validation

- 👥 **User Authentication**

  - Sign up and sign in with Supabase Auth
  - Role-based access control (Customer/Admin)
  - Protected admin routes

- 🎨 **Modern UI/UX**

  - Mobile-first responsive design
  - Beautiful, clean interface with shadcn/ui components
  - Smooth animations and transitions
  - Accessible design patterns

- 🔧 **Admin Dashboard**

  - Product management (CRUD operations)
  - Category management
  - Order management
  - User management
  - Analytics dashboard

- 🛒 **Shopping Features**
  - Add/remove items from cart
  - Quantity management
  - Price calculations with tax and shipping
  - Multiple payment methods (mock implementation)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd jewelry-store
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Admin Credentials
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourstore.com
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password
```

**Important**: The admin credentials are used for the admin panel access. Make sure to:

1. Create a user in Supabase Auth with these credentials
2. Update the `supabase-schema.sql` file to use your `ADMIN_EMAIL` instead of the placeholder
3. Run the updated schema in your Supabase SQL editor

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout process
│   ├── products/          # Product pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Site header with navigation
│   ├── Footer.tsx        # Site footer
│   ├── ProductCard.tsx   # Product display card
│   └── AddToCartButton.tsx
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── CartContext.tsx   # Shopping cart state
├── data/                 # Static data
│   └── navigation.ts     # Navigation structure
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── supabase-client.ts
│   ├── supabase-server.ts
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    └── index.ts
```

## Database Schema

The application uses the following main tables:

- **categories**: Product categories and subcategories
- **products**: Product information and details
- **users**: Extended user profiles (extends Supabase auth)
- **orders**: Order information
- **order_items**: Individual items within orders

## Key Features Implementation

### Authentication

- Uses Supabase Auth for user management
- Role-based access control with admin/customer roles
- Protected routes for admin functionality

### Shopping Cart

- Context-based state management
- Persistent storage with localStorage
- Real-time price calculations

### Product Management

- Dynamic product pages with SEO-friendly URLs
- Category-based filtering and search
- Image optimization with Next.js Image component

### Admin Dashboard

- Complete CRUD operations for products and categories
- Order management system
- User management interface

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@jewelrystore.com or create an issue in the repository.
