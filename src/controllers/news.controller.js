const { StatusCodes } = require('http-status-codes');
const News = require('../models/news.model');
const { deleteFile } = require('../utils/file.utils');

exports.createNews = async (req, res) => {
  try {
    const news = new News({
      ...req.body,
      author: req.user.id,
      image: req.file ? {
        url: `/uploads/news/${req.file.filename}`,
        publicId: req.file.filename
      } : undefined
    });

    await news.save();
    res.status(StatusCodes.CREATED).json(news);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating news',
      error: error.message
    });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate('author', 'username')
      .sort('-createdAt');
    res.status(StatusCodes.OK).json(news);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching news',
      error: error.message
    });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'username');
    
    if (!news) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'News not found'
      });
    }

    res.status(StatusCodes.OK).json(news);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching news',
      error: error.message
    });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'News not found'
      });
    }

    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to update this news'
      });
    }

    let oldImagePath;
    if (req.file && news.image) {
      oldImagePath = `uploads/news/${news.image.publicId}`;
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: req.file ? {
          url: `/uploads/news/${req.file.filename}`,
          publicId: req.file.filename
        } : news.image
      },
      { new: true, runValidators: true }
    );

    if (oldImagePath) {
      await deleteFile(oldImagePath);
    }

    res.status(StatusCodes.OK).json(updatedNews);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating news',
      error: error.message
    });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'News not found'
      });
    }

    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to delete this news'
      });
    }

    if (news.image?.publicId) {
      await deleteFile(`uploads/news/${news.image.publicId}`);
    }

    await News.deleteOne({ _id: req.params.id });
    res.status(StatusCodes.OK).json({
      message: 'News deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting news',
      error: error.message
    });
  }
};
