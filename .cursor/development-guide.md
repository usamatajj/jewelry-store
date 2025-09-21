# Jewelry Store - Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Git

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd jewelry-store

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Set up database
# Run the SQL schema from supabase-schema.sql in your Supabase SQL editor

# Start development server
npm run dev
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
npm run dev

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Build check
npm run build
```

### 3. Testing (Planned)

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## Project Structure Guidelines

### File Organization

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth route group
│   ├── admin/             # Admin pages
│   ├── products/          # Product pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── types/                # TypeScript definitions
└── data/                 # Static data
```

### Naming Conventions

- **Files**: kebab-case (`product-card.tsx`)
- **Components**: PascalCase (`ProductCard`)
- **Functions**: camelCase (`getProducts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`Product`, `User`)

### Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Next.js imports
import Link from 'next/link';
import Image from 'next/image';

// 3. Third-party imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// 4. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// 5. Relative imports
import './styles.css';
```

## Component Development

### Component Structure

```typescript
// src/components/ProductCard.tsx
'use client'; // Only if needed

import React from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Component logic here

  return <div className="product-card">{/* JSX here */}</div>;
}
```

### Component Guidelines

1. **Single Responsibility**: One component, one purpose
2. **Props Interface**: Always define TypeScript interfaces
3. **Default Props**: Use default parameters instead of defaultProps
4. **Event Handlers**: Use descriptive names (`handleAddToCart`)
5. **Conditional Rendering**: Use early returns for cleaner code

### Styling Guidelines

```typescript
// Use Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">

// Use CSS variables for theming
<div className="bg-primary text-primary-foreground">

// Use responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## State Management

### Context Usage

```typescript
// Create context
const CartContext = createContext<CartContextType | null>(null);

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```

### State Guidelines

1. **Global State**: Use Context for app-wide state (Auth, Cart)
2. **Local State**: Use useState for component-specific state
3. **Server State**: Use async/await in server components
4. **Form State**: Use React Hook Form for form state

## Data Fetching

### Server Components

```typescript
// src/app/products/page.tsx
async function getProducts() {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Client Components

```typescript
// src/components/ProductList.tsx
'use client';

import { useEffect, useState } from 'react';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Form Handling

### Form Setup

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Form Guidelines

1. **Validation**: Use Zod schemas for validation
2. **Error Handling**: Display errors clearly to users
3. **Loading States**: Show loading during submission
4. **Accessibility**: Use proper labels and ARIA attributes

## Database Operations

### Supabase Queries

```typescript
// Create
const { data, error } = await supabase
  .from('products')
  .insert({ name: 'New Product', price: 99.99 });

// Read
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId);

// Update
const { data, error } = await supabase
  .from('products')
  .update({ price: 149.99 })
  .eq('id', productId);

// Delete
const { error } = await supabase.from('products').delete().eq('id', productId);
```

### Query Guidelines

1. **Select Fields**: Only select needed fields
2. **Use Indexes**: Query on indexed fields when possible
3. **Error Handling**: Always handle errors
4. **Type Safety**: Use TypeScript interfaces

## Error Handling

### Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### Error Handling Patterns

```typescript
// Try-catch for async operations
try {
  const { data, error } = await supabase.from('products').select('*');

  if (error) throw error;

  return data;
} catch (error) {
  console.error('Database error:', error);
  return [];
}

// Error states in components
const [error, setError] = useState<string | null>(null);

if (error) {
  return <div className="error">Error: {error}</div>;
}
```

## Testing Guidelines

### Unit Testing (Planned)

```typescript
// src/components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  // ... other properties
};

test('renders product name', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
});
```

### Integration Testing (Planned)

```typescript
// src/app/__tests__/products.test.tsx
import { render, screen } from '@testing-library/react';
import ProductsPage from '../products/page';

test('displays products', async () => {
  render(await ProductsPage());
  expect(screen.getByText('Products')).toBeInTheDocument();
});
```

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

// Use Next.js Image component
<Image
  src="/product-image.jpg"
  alt="Product description"
  width={300}
  height={300}
  priority={isAboveFold}
/>;
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

### Caching

```typescript
// Cache expensive operations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

## Debugging

### Development Tools

1. **React DevTools**: Component inspection
2. **Next.js DevTools**: Performance analysis
3. **Supabase Dashboard**: Database inspection
4. **Browser DevTools**: Network and console

### Common Issues

1. **Hydration Mismatch**: Check server/client rendering differences
2. **Type Errors**: Ensure proper TypeScript configuration
3. **Database Errors**: Check RLS policies and permissions
4. **Build Errors**: Verify all imports and dependencies

### Debugging Tips

```typescript
// Use console.log for debugging
console.log('Debug data:', data);

// Use React DevTools Profiler
// Use Next.js built-in debugging
// Check Supabase logs in dashboard
```

## Deployment

### Environment Setup

1. **Production Environment**: Set up production Supabase project
2. **Environment Variables**: Configure production secrets
3. **Database Migration**: Run schema on production database
4. **Domain Configuration**: Set up custom domain

### Build Process

```bash
# Build for production
npm run build

# Start production server
npm start

# Check build output
npm run build -- --debug
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Build passes without errors
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security reviewed

## Maintenance

### Regular Tasks

1. **Dependency Updates**: Keep packages up to date
2. **Security Audits**: Regular security reviews
3. **Performance Monitoring**: Track Core Web Vitals
4. **Error Monitoring**: Set up error tracking

### Code Review Guidelines

1. **Functionality**: Does it work as expected?
2. **Code Quality**: Is it readable and maintainable?
3. **Performance**: Are there any performance issues?
4. **Security**: Are there any security vulnerabilities?
5. **Testing**: Is it properly tested?

### Documentation Updates

1. **API Changes**: Update API documentation
2. **Component Changes**: Update component documentation
3. **Database Changes**: Update schema documentation
4. **Deployment Changes**: Update deployment guide
