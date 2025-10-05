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

/**
 * Upload payment screenshot for bank transfer
 * @param file - The screenshot file to upload
 * @param orderId - Optional order ID (if order already created)
 * @returns Upload result with URL and path
 */
export async function uploadPaymentScreenshot(
  file: File,
  orderId?: string
): Promise<UploadResult> {
  const supabase = await createClient();

  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();

  // Store in orders folder with order ID if available, otherwise temp
  const fileName = orderId
    ? `orders/${orderId}/payment-${timestamp}.${fileExtension}`
    : `temp/payment-${timestamp}-${randomId}.${fileExtension}`;

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('payment-screenshots')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading payment screenshot:', error);
    throw new Error(`Failed to upload payment screenshot: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('payment-screenshots').getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Move payment screenshot from temp to order folder
 * @param tempPath - Temporary file path
 * @param orderId - Order ID
 * @returns New public URL
 */
export async function movePaymentScreenshotToOrder(
  tempPath: string,
  orderId: string
): Promise<string> {
  const supabase = await createClient();

  const fileName = tempPath.split('/').pop();
  const newPath = `orders/${orderId}/${fileName}`;

  // Copy file from temp to order folder
  const { error: copyError } = await supabase.storage
    .from('payment-screenshots')
    .copy(tempPath, newPath);

  if (copyError) {
    console.error('Error moving payment screenshot:', copyError);
    throw new Error(`Failed to move screenshot: ${copyError.message}`);
  }

  // Delete temp file
  const { error: deleteError } = await supabase.storage
    .from('payment-screenshots')
    .remove([tempPath]);

  if (deleteError) {
    console.warn('Failed to delete temp payment screenshot:', deleteError);
  }

  // Get new public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('payment-screenshots').getPublicUrl(newPath);

  return publicUrl;
}

/**
 * Delete payment screenshot
 * @param path - File path to delete
 */
export async function deletePaymentScreenshot(path: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from('payment-screenshots').remove([path]);

  if (error) {
    console.error('Error deleting payment screenshot:', error);
    throw new Error(`Failed to delete screenshot: ${error.message}`);
  }
}
