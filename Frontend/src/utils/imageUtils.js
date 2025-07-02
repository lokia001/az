// Frontend/src/utils/imageUtils.js
/**
 * Utility for handling image URLs with Cloudinary or fallback.
 */

/**
 * Returns optimized image URL or placeholder.
 * @param {string} url
 * @param {{width?: number, height?: number}} options
 * @returns {string}
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url) {
    return getPlaceholder(options.width, options.height);
  }
  if (url.startsWith('http')) {
    return url;
  }
  // prepend API base if relative
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${base}${clean}`;
}

/**
 * Placeholder from via.placeholder.com
 */
function getPlaceholder(w = 400, h = 300, text = 'No Image') {
  return `https://via.placeholder.com/${w}x${h}?text=${encodeURIComponent(text)}`;
}

/**
 * Get display image for space object
 */
export function getSpaceImageUrl(space, index = null, options = {}) {
  if (!space?.spaceImages?.length) {
    return getPlaceholder(options.width, options.height, space?.name || 'Space');
  }
  const imgObj = index != null && space.spaceImages[index]
    ? space.spaceImages[index]
    : space.spaceImages.find(i => i.isCoverImage) || space.spaceImages[0];
  return getOptimizedImageUrl(imgObj.imageUrl, options);
}

/**
 * Get image for favorite DTO
 */
export function getFavoriteSpaceImageUrl(fav, options = {}) {
  if (!fav?.spaceImageUrl) {
    return getPlaceholder(options.width, options.height, fav?.spaceName || 'Space');
  }
  return getOptimizedImageUrl(fav.spaceImageUrl, options);
}
