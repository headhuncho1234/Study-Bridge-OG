import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const uploadCommunityImage = async (file: File, userId: string): Promise<string> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`File ${file.name} has an invalid type. Only images are allowed.`);
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('community-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Failed to upload ${file.name}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('community-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const uploadMultipleImages = async (files: File[], userId: string): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadCommunityImage(file, userId));
  return Promise.all(uploadPromises);
};
