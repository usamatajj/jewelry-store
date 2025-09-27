import { createClient } from '@/lib/supabase-client';

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadProductImages(
  files: File[],
  productId?: string
): Promise<UploadResult[]> {
  const supabase = await createClient();
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = productId
      ? `products/${productId}/${timestamp}-${randomId}.${fileExtension}`
      : `products/temp/${timestamp}-${randomId}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(data.path);

    results.push({
      url: publicUrl,
      path: data.path,
    });
  }

  return results;
}

export async function deleteProductImages(paths: string[]): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from('product-images').remove(paths);

  if (error) {
    console.error('Error deleting images:', error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}

export async function moveTempImagesToProduct(
  tempPaths: string[],
  productId: string
): Promise<string[]> {
  const supabase = await createClient();
  const newPaths: string[] = [];

  for (const tempPath of tempPaths) {
    const fileName = tempPath.split('/').pop();
    const newPath = `products/${productId}/${fileName}`;

    // Copy file from temp to product folder
    const { error: copyError } = await supabase.storage
      .from('product-images')
      .copy(tempPath, newPath);

    if (copyError) {
      console.error('Error moving file:', copyError);
      throw new Error(`Failed to move ${tempPath}: ${copyError.message}`);
    }

    // Delete temp file
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([tempPath]);

    if (deleteError) {
      console.warn('Failed to delete temp file:', deleteError);
    }

    // Get new public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(newPath);

    newPaths.push(publicUrl);
  }

  return newPaths;
}
