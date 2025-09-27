'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  onImagesChange: (files: ImageFile[]) => void;
  initialImages?: { url: string; path: string }[];
  maxImages?: number;
}

export default function ImageUpload({
  onImagesChange,
  initialImages = [],
  maxImages = 5,
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] =
    useState<{ url: string; path: string }[]>(initialImages);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalImages = images.length + existingImages.length;
    const remainingSlots = maxImages - totalImages;

    if (fileArray.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more images`);
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs and store files locally
    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(2, 15),
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    toast.success(
      `${validFiles.length} image(s) selected. Upload will happen when you save the product.`
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>
        Product Images ({images.length + existingImages.length}/{maxImages})
      </Label>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop images here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP up to 5MB each (max {maxImages} images)
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Image Preview Grid */}
      {(images.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group">
              <Card className="overflow-hidden aspect-square">
                <Image
                  src={image.url}
                  alt={`Existing product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingImage(index);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
              <div className="mt-1 text-xs text-gray-500 text-center truncate">
                {index === 0 && existingImages.length === 1 && 'Main Image'}
                {index === 0 && existingImages.length > 1 && 'Existing Image 1'}
                {index > 0 && `Existing Image ${index + 1}`}
              </div>
            </div>
          ))}

          {/* New Images */}
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <Card className="overflow-hidden aspect-square">
                <Image
                  src={image.preview}
                  alt={`New product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
              <div className="mt-1 text-xs text-gray-500 text-center truncate">
                {existingImages.length === 0 &&
                  index === 0 &&
                  'Main Image (New)'}
                {existingImages.length === 0 &&
                  index > 0 &&
                  `Image ${index + 1} (New)`}
                {existingImages.length > 0 && `New Image ${index + 1}`}
              </div>
            </div>
          ))}

          {/* Add more button */}
          {images.length + existingImages.length < maxImages && (
            <Card
              className="border-2 border-dashed border-gray-300 aspect-square flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={openFileDialog}
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Add Image</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Helper Text */}
      {images.length === 0 && existingImages.length === 0 && (
        <p className="text-sm text-red-500 font-medium">
          ⚠️ At least one image is required for the product. The first image
          will be used as the main product image.
        </p>
      )}
    </div>
  );
}
