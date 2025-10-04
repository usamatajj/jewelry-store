# Category Hierarchy Migration Guide

## What's Changed

Your jewelry store now has a **hierarchical category system** with parent and child categories!

### Before

```
Categories (Flat List):
- Women
- Necklaces
- Earrings
- Men
- Chains
...
```

### After

```
Categories (Hierarchical):
Women
├── Necklaces
├── Earrings
├── Rings
└── Bracelets
Men
├── Chains
├── Cufflinks
└── Wallets
...
```

## What You Need to Do

### Step 1: Run the SQL Migration

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the contents of `add-parent-categories.sql`
4. Paste and click **Run**

This will:

- Create parent categories (Women, Men, Couple, etc.)
- Link existing subcategories to their parents
- Create any missing categories

### Step 2: Verify the Migration

Run this query to check the structure:

```sql
SELECT
  COALESCE(p.name, 'TOP-LEVEL') AS parent_category,
  c.name AS category,
  c.slug
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY p.name NULLS FIRST, c.name;
```

You should see something like:

| parent_category | category      | slug          |
| --------------- | ------------- | ------------- |
| TOP-LEVEL       | Couple        | couple        |
| TOP-LEVEL       | Gems          | gems          |
| TOP-LEVEL       | Men           | men           |
| TOP-LEVEL       | Women         | women         |
| Couple          | His & Hers    | his-hers      |
| Couple          | Matching Sets | matching-sets |
| Women           | Earrings      | earrings      |
| Women           | Necklaces     | necklaces     |

### Step 3: Update Existing Products (If Needed)

If you have products assigned to parent categories (like "Women"), you'll need to reassign them to subcategories (like "Necklaces"):

```sql
-- Find products assigned to parent categories
SELECT p.id, p.name, c.name as category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.parent_id IS NULL
AND c.slug IN ('women', 'men', 'couple', 'gems', 'personalized', 'gifting', 'our-world');

-- Example: Move Women's products to Necklaces
UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'necklaces')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'women');
```

### Step 4: Test the Admin Panel

1. Navigate to `/admin`
2. Go to the **Categories** tab
3. You should see categories grouped by parent:
   - **Women** (with Necklaces, Earrings, etc. underneath)
   - **Men** (with Chains, Cufflinks, etc. underneath)
   - etc.

### Step 5: Test Product Creation

1. Click **Add Product** in the admin panel
2. In the **Category** dropdown, you should see:
   ```
   Women
     └─ Necklaces
     └─ Earrings
     └─ Rings
   Men
     └─ Chains
     └─ Cufflinks
   ```
3. Select a **subcategory** (not a parent)
4. Create a test product

## What's Improved

### Admin Panel

✅ **Hierarchical Category Display**

- Categories grouped by parent
- Easy to see relationships
- Better organization

✅ **Improved Product Form**

- Categories grouped in dropdown
- Parent categories as headers
- Only subcategories are selectable

✅ **Enhanced Category Management**

- Create parent and child categories
- Link/unlink categories
- Visual hierarchy

### Code Changes

The following files were updated:

- ✅ `add-parent-categories.sql` - Migration script (NEW)
- ✅ `src/components/admin/ProductForm.tsx` - Hierarchical category selector
- ✅ `src/app/admin/page.tsx` - Hierarchical category display
- ✅ `src/lib/category-utils.ts` - New utility functions
- ✅ `.cursor/CATEGORY_HIERARCHY.md` - Documentation (NEW)

### Database

✅ **Schema** - Already supports `parent_id` (no changes needed)
✅ **Data** - Will be updated by the migration script

## Important Notes

### ⚠️ Product Assignment Rule

**Products should ONLY be assigned to subcategories, not parent categories.**

✅ Correct:

```typescript
category_id: 'uuid-of-necklaces'; // Necklaces is a subcategory
```

❌ Incorrect:

```typescript
category_id: 'uuid-of-women'; // Women is a parent category
```

### 🔄 Existing Behavior Preserved

- All existing category routes still work (`/women/necklaces`)
- Product queries remain the same
- No breaking changes to the frontend

### 📝 New Utilities Available

```typescript
import {
  organizeCategories,
  getParentCategories,
  getChildCategories,
} from '@/lib/category-utils';

// Use these to work with hierarchical categories
const organized = organizeCategories(categories);
```

## Rollback (If Needed)

If something goes wrong, you can rollback by setting all `parent_id` to NULL:

```sql
-- CAUTION: This removes the hierarchy
UPDATE categories SET parent_id = NULL;
```

## Questions?

- 📄 See full documentation in `.cursor/CATEGORY_HIERARCHY.md`
- 🔍 Check existing category data with:
  ```sql
  SELECT * FROM categories ORDER BY parent_id NULLS FIRST, name;
  ```
- 🛠️ Test the admin panel at `/admin`

## Next Steps After Migration

1. ✅ Verify category hierarchy in admin panel
2. ✅ Check product assignments
3. ✅ Test creating new products
4. ✅ Test creating new categories
5. ✅ Deploy changes to production (after testing locally)

---

**Ready to migrate? Run the SQL script in Supabase!** 🚀
