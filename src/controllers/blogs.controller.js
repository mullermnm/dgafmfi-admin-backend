const { StatusCodes } = require('http-status-codes');
const Blog = require('../models/blog.model');
const { deleteFile } = require('../utils/file.utils');

exports.createBlog = async (req, res) => {
  try {
    const blog = new Blog({
      ...req.body,
      author: req.user.id,
      image: req.file ? {
        url: `/uploads/blogs/${req.file.filename}`,
        publicId: req.file.filename
      } : undefined
    });

    await Blog.save();
    res.status(StatusCodes.CREATED).json(blog);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating blog',
      error: error.message
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username')
      .sort('-createdAt');
    res.status(StatusCodes.OK).json(blogs);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username');
    
    if (!blog) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Blog not found'
      });
    }

    res.status(StatusCodes.OK).json(blog);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to update this blog'
      });
    }

    let oldImagePath;
    if (req.file && blog.image) {
      oldImagePath = `uploads/blogs/${blog.image.publicId}`;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: req.file ? {
          url: `/uploads/blogs/${req.file.filename}`,
          publicId: req.file.filename
        } : blog.image
      },
      { new: true, runValidators: true }
    );

    if (oldImagePath) {
      await deleteFile(oldImagePath);
    }

    res.status(StatusCodes.OK).json(updatedBlog);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating blog',
      error: error.message
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to delete this blog'
      });
    }

    if (blog.image?.publicId) {
      await deleteFile(`uploads/blogs/${blog.image.publicId}`);
    }

    await Blog.deleteOne({ _id: req.params.id });
    res.status(StatusCodes.OK).json({
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting blog',
      error: error.message
    });
  }
};
