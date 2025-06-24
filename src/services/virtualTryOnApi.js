// Configuration for the virtual try-on API
const API_CONFIG = {
  // Replace with your actual AI API endpoint
  endpoint: import.meta.env.VITE_VIRTUAL_TRYON_API_URL || '/api/virtual-try-on',
  // Replace with your API key
  apiKey: import.meta.env.VITE_VIRTUAL_TRYON_API_KEY || '',
  timeout: 30000, // 30 seconds timeout
};

/**
 * Process virtual try-on using AI API
 * This function handles the integration with your AI model API
 */
export const processVirtualTryOn = async (request) => {
  try {
    const formData = new FormData();
    formData.append('userImage', request.userImage);
    formData.append('productId', request.productId);
    formData.append('productImage', request.productImage);

    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        // Add your API key if required
        ...(API_CONFIG.apiKey && { 'Authorization': `Bearer ${API_CONFIG.apiKey}` }),
      },
      body: formData,
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Virtual try-on API error:', error);
    
    // Return error response
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Virtual try-on processing failed',
    };
  }
};

/**
 * Validate image file for virtual try-on
 */
export const validateImageFile = (file) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image file size must be less than 10MB' };
  }

  return { valid: true };
};

/**
 * Prepare image for optimal AI processing
 */
export const prepareImageForProcessing = async (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set optimal dimensions for AI processing
      const maxWidth = 1024;
      const maxHeight = 1024;
      
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        },
        'image/jpeg',
        0.8 // 80% quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};