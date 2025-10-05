'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Category } from '@/types';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export default function CategoryForm({
  category,
  categories,
  onSuccess,
  trigger,
}: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    parent_id: category?.parent_id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = await createClient();
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (category) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            parent_id: formData.parent_id || null,
            slug,
          })
          .eq('id', category.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const { error } = await supabase.from('categories').insert({
          name: formData.name,
          parent_id: formData.parent_id || null,
          slug,
        });

        if (error) throw error;
        toast.success('Category created successfully');
      }

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    if (
      !confirm(
        'Are you sure you want to delete this category? This will also delete all products in this category.'
      )
    )
      return;

    setLoading(true);
    try {
      const supabase = await createClient();

      // First delete all products in this category
      await supabase.from('products').delete().eq('category_id', category.id);

      // Then delete the category
      const { error } = await supabase.from('categories').delete().eq('id', category.id);

      if (error) throw error;
      toast.success('Category deleted successfully');
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // Filter out the current category and its children from parent options
  const parentOptions = categories.filter(
    (cat) =>
      cat.id !== category?.id && (!category?.parent_id || cat.id !== category.parent_id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{category ? 'Edit Category' : 'Add Category'}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="parent">Parent Category (Optional)</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No parent (Top-level category)</SelectItem>
                {parentOptions.map((parentCategory) => (
                  <SelectItem key={parentCategory.id} value={parentCategory.id}>
                    {parentCategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <div>
              {category && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : category ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
