const express = require('express');
const router = express.Router();
const {
  createMediaAsset,
  getAllMediaAssets,
  getMediaAssetById,
  updateMediaAsset,
  deleteMediaAsset
} = require('./media-asset.controller');
const { validateMediaAsset } = require('./mdia-asset.validation');
const validateRequest = require('../../middleware/validateRequest');

// Routes
router.post('/', [...validateMediaAsset, validateRequest()], createMediaAsset);
router.get('/', getAllMediaAssets);
router.get('/:id', getMediaAssetById);
router.put('/:id', [...validateMediaAsset, validateRequest()], updateMediaAsset);
router.delete('/:id', deleteMediaAsset);

module.exports = router;