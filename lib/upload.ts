// File Upload Utils

import supabase from './supabase';

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket to use (defaults to 'blog-images')
 * @returns Object containing the public URL and path of the uploaded file
 */
export async function uploadFile(file: File, bucket: string = 'blog-images'): Promise<{ url: string; path: string }> {
  try {
    console.log('Uploading file to Supabase:', file.name);
    
    // Ensure unique filename by adding timestamp
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${file.name.split('.')[0]}-${timestamp}.${fileExt}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file to Supabase:', error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return { 
      path: data.path,
      url: publicUrl
    };
    
  } catch (error) {
    console.error('Supabase upload failed, falling back to local implementation:', error);
    
    // Fallback to local implementation for development
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve({
          url: base64,
          path: `uploads/${file.name}`
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path The path of the file to delete
 * @param bucket The storage bucket to use (defaults to 'blog-images')
 * @returns True if the deletion was successful
 */
export async function deleteFile(path: string, bucket: string = 'blog-images'): Promise<boolean> {
  try {
    console.log('Deleting file from Supabase:', path);
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting file from Supabase:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
} 