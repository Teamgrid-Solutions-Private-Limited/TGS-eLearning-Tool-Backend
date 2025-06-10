const MediaAsset = require('../../models/media-asset.model');
const asyncHandler = require('../../middleware/asyncHandler');

// Create a new media asset
exports.createMediaAsset = asyncHandler(async (req, res) => {
  console.log('Creating media asset with body:', req.body);
  try {
    const mediaAsset = await MediaAsset.create(req.body);
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