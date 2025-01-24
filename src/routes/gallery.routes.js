const express = require('express');
const router = express.Router();
const {
  getAllGalleries,
  createGallery,
  updateGallery,
  getGalleryById,
  deleteGallery,
  updateImageCaption,
  deleteImage,
  getAllImages,
  uploadImages,
  deleteImageCarousel
} = require('../controllers/gallery.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadMedia } = require('../middleware/upload.middleware');

// Carousel routes (must be before /:id routes to avoid conflict)
router.get('/images', protect, getAllImages);
router.post('/images/upload', protect, uploadMedia.array('images'), uploadImages);
router.delete('/images/:imageId', protect, deleteImageCarousel);

// Regular gallery routes
router.route('/')
  .get(getAllGalleries)
  .post(protect, authorize('admin'), uploadMedia.single('image'), createGallery);

router.route('/:id')
  .get(getGalleryById)
  .put(protect, authorize('admin'), uploadMedia.single('image'), updateGallery)
  .delete(protect, authorize('admin'), deleteGallery);

router.route('/:galleryId/images/:imageId')
  .put(protect, authorize('admin'), updateImageCaption)
  .delete(protect, authorize('admin'), deleteImage);

module.exports = router;
