'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Category, Product } from '@/types';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import { uploadProductImages, moveTempImagesToProduct } from '@/lib/storage';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export default function ProductForm({
  product,
  categories,
  onSuccess,
  trigger,
}: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category_id: product?.category_id || '',
  });
  const [productImages, setProductImages] = useState<ImageFile[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate that we have at least one image
      const hasNewImages = productImages.length > 0;
      const hasExistingImages = product?.images && product.images.length > 0;

      if (!hasNewImages && !hasExistingImages) {
        toast.error('Please upload at least one image for the product');
        setLoading(false);
        return;
      }

      const supabase = await createClient();
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      let finalImages: string[] = [];

      if (productImages.length > 0) {
        // Upload the new files to Supabase Storage
        const uploadResults = await uploadProductImages(
          productImages.map((img) => img.file),
          product?.id
        );

        const newImageUrls = uploadResults.map((result) => result.url);

        if (product) {
          // For existing products, combine existing images with new ones
          const existingImages = product.images || [];
          finalImages = [...existingImages, ...newImageUrls];
        } else {
          // For new products, use only new images
          finalImages = newImageUrls;
        }
      } else if (product?.images && product.images.length > 0) {
        // If no new images uploaded but product has existing images, keep them
        finalImages = product.images;
      }

      if (product) {
        // Update existing product
        const updateData: Record<string, unknown> = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          images: finalImages,
          slug,
        };

        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const insertData: Record<string, unknown> = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          images: finalImages,
          slug,
        };

        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Images were already included in the insertData above, no need for additional update

        toast.success('Product created successfully');
      }

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (!confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      toast.success('Product deleted successfully');
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{product ? 'Edit Product' : 'Add Product'}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <ImageUpload
              onImagesChange={setProductImages}
              initialImages={
                product?.images?.map((url) => ({ url, path: '' })) || []
              }
              maxImages={5}
            />
            <p className="text-xs text-gray-500 mt-2">
              * At least one image is required for the product
            </p>
          </div>

          <div className="flex justify-between">
            <div>
              {product && (
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
                {loading ? 'Saving...' : product ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
