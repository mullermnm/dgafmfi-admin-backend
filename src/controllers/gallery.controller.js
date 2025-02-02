const { StatusCodes } = require('http-status-codes');
const Gallery = require('../models/gallery.model');
const { deleteFile } = require('../utils/file.utils');

exports.createGallery = async (req, res) => {
  try {
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/gallery/${file.filename}`,
      publicId: file.filename,
      caption: '',
      contentType: file.mimetype
    })) : [];

    const gallery = new Gallery({
      ...req.body,
      author: req.user.id,
      images
    });

    await gallery.save();
    res.status(StatusCodes.CREATED).json(gallery);
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      await Promise.all(req.files.map(file => deleteFile(file.path)));
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating gallery',
      error: error.message
    });
  }
};

exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .populate('author', 'username')
      .sort('-createdAt');
    res.status(StatusCodes.OK).json(galleries);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching galleries',
      error: error.message
    });
  }
};

exports.getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('author', 'username');
    
    if (!gallery) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Gallery not found'
      });
    }

    res.status(StatusCodes.OK).json(gallery);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching gallery',
      error: error.message
    });
  }
};

exports.updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Gallery not found'
      });
    }

    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to update this gallery'
      });
    }

    const newImages = req.files ? req.files.map(file => ({
      url: `/uploads/galleries/${file.filename}`,
      publicId: file.filename,
      caption: '',
      contentType: file.mimetype
    })) : [];

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images: [...gallery.images, ...newImages]
      },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json(updatedGallery);
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      await Promise.all(req.files.map(file => deleteFile(file.path)));
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating gallery',
      error: error.message
    });
  }
};

exports.updateImageCaption = async (req, res) => {
  try {
    const { galleryId, imageId } = req.params;
    const { caption } = req.body;

    const gallery = await Gallery.findById(galleryId);
    
    if (!gallery) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Gallery not found'
      });
    }

    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to update this gallery'
      });
    }

    const imageIndex = gallery.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Image not found in gallery'
      });
    }

    gallery.images[imageIndex].caption = caption;
    await gallery.save();

    res.status(StatusCodes.OK).json(gallery);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating image caption',
      error: error.message
    });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { galleryId, imageId } = req.params;

    const gallery = await Gallery.findById(galleryId);
    
    if (!gallery) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Gallery not found'
      });
    }

    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to update this gallery'
      });
    }

    const imageIndex = gallery.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Image not found in gallery'
      });
    }

    const image = gallery.images[imageIndex];
    await deleteFile(`uploads/galleries/${image.publicId}`);

    gallery.images.splice(imageIndex, 1);
    await gallery.save();

    res.status(StatusCodes.OK).json(gallery);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting image',
      error: error.message
    });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Gallery not found'
      });
    }

    if (gallery.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to delete this gallery'
      });
    }

    await Promise.all(gallery.images.map(image => deleteFile(`uploads/galleries/${image.publicId}`)));
    await Gallery.deleteOne({ _id: req.params.id });
    res.status(StatusCodes.OK).json({
      message: 'Gallery deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting gallery',
      error: error.message
    });
  }
};

// Get all images from the gallery (carousel)
exports.getAllImages = async (req, res) => {
  try {
    const gallery = await Gallery.findOne();
    res.status(StatusCodes.OK).json(gallery ? gallery.images : []);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching gallery images',
      error: error.message
    });
  }
};

// Upload multiple images to the gallery
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No images uploaded'
      });
    }

    const imageObjects = req.files.map(file => ({
      url: `/uploads/galleries/${file.filename}`,
      publicId: file.filename
    }));

    let gallery = await Gallery.findOne();
    
    if (!gallery) {
      gallery = new Gallery({ images: imageObjects });
    } else {
      gallery.images.push(...imageObjects);
    }

    await gallery.save();
    res.status(StatusCodes.CREATED).json(gallery.images);
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      await Promise.all(req.files.map(file => deleteFile(file.path)));
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// Delete an image from the gallery
exports.deleteImageCarousel = async (req, res) => {
  try {
    const gallery = await Gallery.findOne();
    if (!gallery) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Gallery not found'
      });
    }

    const image = gallery.images.id(req.params.imageId);
    if (!image) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Image not found'
      });
    }

    // Delete the file
    await deleteFile(`uploads/galleries/${image.publicId}`);

    // Remove the image from the gallery
    gallery.images.pull(req.params.imageId);
    await gallery.save();

    res.status(StatusCodes.OK).json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting image',
      error: error.message
    });
  }
};
