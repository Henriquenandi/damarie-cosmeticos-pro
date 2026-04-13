import { supabaseHelpers } from '@/api/supabaseClient';
import { generateUUID } from './uuid';

/**
 * Upload helpers for different entity types
 */

/**
 * Get the correct bucket for each entity type
 * @param {string} entityType - Type of entity (product, mercadoria, presente, document)
 * @returns {string} Bucket name
 */
const getBucketForEntity = (entityType) => {
  const bucketMap = {
    'product': 'damarie-products',
    'mercadoria': 'damarie-mercadorias', 
    'presente': 'damarie-presentes',
    'document': 'damarie-documents'
  };
  return bucketMap[entityType] || 'damarie-documents';
};

/**
 * Upload image file to correct bucket
 * @param {File} file - Image file to upload
 * @param {string} entityType - Type of entity (product, mercadoria, presente)
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadImage = async (file, entityType = 'product') => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Por favor, selecione apenas arquivos de imagem');
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Imagem muito grande. Máximo 5MB');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  // Get correct bucket
  const bucket = getBucketForEntity(entityType);

  // Upload file
  await supabaseHelpers.uploadFile(bucket, fileName, file);
  
  // Return public URL
  return supabaseHelpers.getFileUrl(bucket, fileName);
};

/**
 * Delete image from storage
 * @param {string} imageUrl - Full URL of the image
 * @param {string} entityType - Type of entity
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (imageUrl, entityType = 'product') => {
  if (!imageUrl) return true;

  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Get correct bucket
    const bucket = getBucketForEntity(entityType);
    
    // Delete file
    await supabaseHelpers.deleteFile(bucket, fileName);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};