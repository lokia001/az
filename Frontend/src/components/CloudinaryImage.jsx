import { Cloudinary } from 'cloudinary-core';

// Initialize Cloudinary instance (optional - chỉ để optimization)
const cloudinaryCore = new Cloudinary({
  cloud_name: 'your-cloud-name', // Có thể lấy từ env hoặc config
  secure: true
});

// Component để display optimized images
export const OptimizedImage = ({ 
  publicId, 
  width, 
  height, 
  alt, 
  className,
  transformations = {} 
}) => {
  if (!publicId) {
    return <div className={`placeholder ${className}`}>{alt}</div>;
  }

  // Generate optimized URL
  const imageUrl = cloudinaryCore.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  });

  return (
    <img 
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

// Helper function để extract public_id từ Cloudinary URL
export const getPublicIdFromUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // Public ID is everything after /upload/v{version}/ or /upload/
    let publicIdParts = urlParts.slice(uploadIndex + 1);
    
    // Remove version if present (starts with 'v' followed by numbers)
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }
    
    // Remove file extension
    const publicId = publicIdParts.join('/').replace(/\.[^.]+$/, '');
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

export default { OptimizedImage, getPublicIdFromUrl };
