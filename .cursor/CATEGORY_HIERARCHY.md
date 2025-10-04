# Category Hierarchy System

## Overview

The jewelry store uses a **two-level hierarchical category system** with parent categories and subcategories. This allows for better organization and navigation of products.

## Database Structure

### Categories Table Schema

```sql
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Fields

- **`id`**: Unique identifier (UUID)
- **`name`**: Display name (e.g., "Women", "Necklaces")
- **`slug`**: URL-friendly identifier (e.g., "women", "necklaces")
- **`parent_id`**: References another category's ID for subcategories (NULL for top-level categories)
- **`created_at`**: Creation timestamp

## Category Hierarchy

### Parent Categories (Top-Level)

These are the main navigation categories with `parent_id = NULL`:

1. **Women** (`women`)
2. **Men** (`men`)
3. **Couple** (`couple`)
4. **Gems** (`gems`)
5. **Personalized** (`personalized`)
6. **Gifting** (`gifting`)
7. **Our World** (`our-world`)

### Subcategories

Each parent category has multiple subcategories with their `parent_id` set to the parent's UUID:

#### Women Subcategories

- Necklaces
- Earrings
- Rings
- Bracelets
- Full Sets
- Engagement Rings
- Minimalist
- Solitaire Rings
- Zodiac
- Anklets
- Nose Pins
- Best Sellers
- New Arrivals

#### Men Subcategories

- Wallets
- Chains
- Cufflinks
- Lapel Pins

#### Couple Subcategories

- Matching Sets
- His & Hers
- Wedding Bands

#### Gems Subcategories

- Diamonds
- Gold
- Silver
- Pearls
- Gemstones

#### Personalized Subcategories

- Engraved Jewelry
- Custom Designs
- Birthstone Jewelry

#### Gifting Subcategories

- Gift Cards
- Gift Sets
- Special Occasions

#### Our World Subcategories

- About Us
- Sustainability
- Careers
- Contact

## Migration

### Running the Migration

To set up the parent-child relationships for existing categories:

```bash
# Using Supabase SQL Editor
# Copy and paste the contents of add-parent-categories.sql
```

Or using psql:

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f add-parent-categories.sql
```

### What the Migration Does

1. Creates parent categories if they don't exist
2. Updates existing subcategories to link to their parents via `parent_id`
3. Inserts any missing subcategories
4. Verifies the hierarchical structure

## Implementation

### TypeScript Interface

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  children?: Category[]; // Populated when organizing categories
}
```

### Utility Functions

Located in `src/lib/category-utils.ts`:

```typescript
// Organize flat categories into hierarchical structure
const organized = organizeCategories(categories);

// Get only parent categories
const parents = getParentCategories(categories);

// Get children of a specific parent
const children = getChildCategories(categories, parentId);
```

### Fetching Categories

#### Get All Categories (Flat)

```typescript
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .order('name');
```

#### Get Categories with Parent Info

```sql
SELECT
  c.*,
  p.name as parent_name,
  p.slug as parent_slug
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY p.name NULLS FIRST, c.name;
```

#### Get Parent Categories Only

```sql
SELECT * FROM categories WHERE parent_id IS NULL ORDER BY name;
```

#### Get Subcategories for a Specific Parent

```sql
SELECT * FROM categories
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'women')
ORDER BY name;
```

## Admin Panel

### Category Display

The admin panel displays categories hierarchically:

```
┌─ Women ─────────────────────────────────────┐
│ Main Category                               │
├─────────────────────────────────────────────┤
│ [Necklaces] [Earrings] [Rings] [Bracelets] │
│ [Full Sets] [Engagement Rings] ...          │
└─────────────────────────────────────────────┘
```

### Product Form Category Selector

When adding/editing products, categories are grouped by parent:

```
Select a category:
├─ Women
│  ├─ Necklaces
│  ├─ Earrings
│  └─ Rings
├─ Men
│  ├─ Chains
│  └─ Cufflinks
└─ ...
```

**Note**: Products should only be assigned to **subcategories**, not parent categories.

### Category Form

The category form allows:

- Creating new parent categories (set `parent_id` to NULL)
- Creating new subcategories (select a parent category)
- Editing existing categories and changing their parent
- Deleting categories (also deletes associated products)

## Best Practices

### 1. Product Assignment

✅ **DO**: Assign products to subcategories

```typescript
category_id: 'uuid-of-necklaces-subcategory';
```

❌ **DON'T**: Assign products to parent categories

```typescript
category_id: 'uuid-of-women-parent-category'; // Wrong!
```

### 2. Category Queries

When fetching products for a parent category (e.g., "Women"), query all subcategories:

```typescript
// Get all Women's products
const womenCategoryId = await getCategoryIdBySlug('women');
const subcategoryIds = await getChildCategories(
  categories,
  womenCategoryId
).map((cat) => cat.id);

const { data: products } = await supabase
  .from('products')
  .select('*')
  .in('category_id', subcategoryIds);
```

### 3. Navigation

URLs should reflect the hierarchy:

- Parent: `/women`
- Subcategory: `/women/necklaces`

### 4. Category Management

- Always verify parent-child relationships before deleting
- Deleting a parent category cascades to delete all children
- Ensure at least one subcategory exists for each parent

## Troubleshooting

### Issue: Categories Not Showing in Hierarchy

**Solution**: Check that `parent_id` is correctly set:

```sql
SELECT id, name, slug, parent_id FROM categories ORDER BY parent_id NULLS FIRST, name;
```

### Issue: Products Not Appearing in Category

**Solution**: Verify products are assigned to subcategories, not parents:

```sql
SELECT p.name, c.name as category, pc.name as parent_category
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN categories pc ON c.parent_id = pc.id;
```

### Issue: Orphaned Categories

**Solution**: Find categories without valid parents:

```sql
SELECT c.* FROM categories c
WHERE c.parent_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM categories p WHERE p.id = c.parent_id);
```

## Related Files

- **Migration**: `add-parent-categories.sql`
- **Types**: `src/types/index.ts`
- **Utilities**: `src/lib/category-utils.ts`
- **Admin Form**: `src/components/admin/CategoryForm.tsx`
- **Product Form**: `src/components/admin/ProductForm.tsx`
- **Admin Page**: `src/app/admin/page.tsx`

## Resources

- [Supabase Foreign Keys](https://supabase.com/docs/guides/database/tables#foreign-key-constraints)
- [PostgreSQL Self-Referencing Tables](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
