const path = require('path');
const { AppError } = require('../middleware/errorHandler');
const { FILE_LIMITS } = require('../config/constants');

/**
 * Upload a file
 * @param {Object} file - The file object from req.files
 * @param {String} folder - The folder to upload to (e.g., 'thumbnails', 'resources')
 * @param {Array} allowedTypes - Array of allowed mime types
 * @returns {Object} - Object containing the file information
 */
exports.uploadFile = async (file, folder, allowedTypes) => {
  // Check if file exists
  if (!file) {
    throw new AppError('Please upload a file', 400);
  }

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(`Please upload a valid file type. Allowed types: ${allowedTypes.join(', ')}`, 400);
  }

  // Check file size
  const maxSize = getMaxFileSize(file.mimetype);
  if (file.size > maxSize) {
    throw new AppError(
      `Please upload a file smaller than ${formatBytes(maxSize)}`,
      400
    );
  }

  // Create custom filename
  const ext = path.parse(file.name).ext;
  file.name = `${folder}_${Date.now()}${ext}`;

  // Move file to upload path
  const uploadPath = path.join(__dirname, '..', 'uploads', folder);
  await file.mv(path.join(uploadPath, file.name));

  return {
    filename: file.name,
    mimetype: file.mimetype,
    size: file.size
  };
};

/**
 * Get maximum file size based on mime type
 * @param {String} mimetype - The file's mime type
 * @returns {Number} - Maximum file size in bytes
 */
const getMaxFileSize = (mimetype) => {
  if (mimetype.startsWith('image')) {
    return FILE_LIMITS.IMAGE;
  }
  if (mimetype.startsWith('video')) {
    return FILE_LIMITS.VIDEO;
  }
  return FILE_LIMITS.DOCUMENT;
};

/**
 * Format bytes to human readable string
 * @param {Number} bytes - The number of bytes
 * @returns {String} - Formatted string (e.g., "2 MB")
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}; 