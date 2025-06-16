const MediaAsset = require('../../models/media-asset.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { uploadFile } = require('../../utils/fileUpload');
const path = require('path');

// Create a new media asset
exports.createMediaAsset = asyncHandler(async (req, res) => {
  console.log('Creating media asset with body:', req.body);
  console.log('Files received:', req.files);
  try {
    // Extract only the fields we need to prevent duplicates
    let mediaAssetData = {
      name: req.body.name,
      type: req.body.type,
      uploadedBy: req.body.uploadedBy,
      // Handle case where organization might be an array
      organization: Array.isArray(req.body.organization) ? req.body.organization[0] : req.body.organization
    };

    // Handle file upload if present
    if (req.files && req.files.file) {
      const file = req.files.file;
      const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif'],
        video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      };

      // Get allowed types based on asset type
      const assetType = req.body.type || 'other';
      const allowedMimeTypes = allowedTypes[assetType] || [];

      // Upload the file
      const uploadedFile = await uploadFile(file, assetType, allowedMimeTypes);

      // Set the URL to the uploaded file path
      mediaAssetData.url = `/uploads/${assetType}/${uploadedFile.filename}`;
      mediaAssetData.mimeType = uploadedFile.mimetype;
      mediaAssetData.size = uploadedFile.size;

      // If it's an image or video, try to get dimensions
      if (assetType === 'image' || assetType === 'video') {
        // You might want to add image/video processing here to get dimensions
        // For now, we'll skip this
      }
    }

    const mediaAsset = await MediaAsset.create(mediaAssetData);
    console.log('Media asset created:', mediaAsset);
    res.status(201).json(mediaAsset);
  } catch (error) {
    console.error('Error creating media asset:', error);
    throw error;
  }
});

// Get all media assets
exports.getAllMediaAssets = asyncHandler(async (req, res) => {
  const mediaAssets = await MediaAsset.find();
  res.status(200).json(mediaAssets);
});

// Get a single media asset by ID
exports.getMediaAssetById = asyncHandler(async (req, res) => {
  const mediaAsset = await MediaAsset.findById(req.params.id);
  if (!mediaAsset) {
    return res.status(404).json({ message: 'Media asset not found' });
  }
  res.status(200).json(mediaAsset);
});

// Update a media asset by ID
exports.updateMediaAsset = asyncHandler(async (req, res) => {
  const mediaAsset = await MediaAsset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!mediaAsset) {
    return res.status(404).json({ message: 'Media asset not found' });
  }
  res.status(200).json(mediaAsset);
});

// Delete a media asset by ID
exports.deleteMediaAsset = asyncHandler(async (req, res) => {
  const mediaAsset = await MediaAsset.findByIdAndDelete(req.params.id);
  if (!mediaAsset) {
    return res.status(404).json({ message: 'Media asset not found' });
  }
  res.status(200).json({ message: 'Media asset deleted successfully' });
});