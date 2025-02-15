const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} = require('../controllers/blogs.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');
const { blogValidation } = require('../middleware/validator.middleware');

router.route('/')
  .get(getAllBlogs)
  .post(protect, authorize('admin'), uploadImage.single('image'), blogValidation, createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(protect, authorize('admin'), uploadImage.single('image'), blogValidation, updateBlog)
  .delete(protect, authorize('admin'), deleteBlog);

module.exports = router;
