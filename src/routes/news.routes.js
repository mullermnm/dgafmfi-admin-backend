const express = require('express');
const router = express.Router();
const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews
} = require('../controllers/news.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const { newsValidation } = require('../middleware/validator.middleware');

router.route('/')
  .get(getAllNews)
  .post(protect, authorize('admin'), uploadImage.single('image'), newsValidation, createNews);

router.route('/:id')
  .get(getNewsById)
  .put(protect, authorize('admin'), uploadImage.single('image'), newsValidation, updateNews)
  .delete(protect, authorize('admin'), deleteNews);

module.exports = router;
