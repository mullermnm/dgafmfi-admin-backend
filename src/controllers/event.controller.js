const { StatusCodes } = require('http-status-codes');
const Event = require('../models/event.model');
const { deleteFile } = require('../utils/file.utils');

exports.createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      author: req.user.id,
      media: req.file ? {
        url: `/uploads/events/${req.file.filename}`,
        publicId: req.file.filename,
        contentType: req.file.mimetype
      } : undefined
    });

    await event.save();
    res.status(StatusCodes.CREATED).json(event);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating event',
      error: error.message
    });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('author', 'username')
      .sort('-date');
    res.status(StatusCodes.OK).json(events);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching events',
      error: error.message
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('author', 'username');
    
    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Event not found'
      });
    }

    res.status(StatusCodes.OK).json(event);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching event',
      error: error.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Event not found'
      });
    }

    if (event.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to update this event'
      });
    }

    let oldMediaPath;
    if (req.file && event.media) {
      oldMediaPath = `uploads/events/${event.media.publicId}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        media: req.file ? {
          url: `/uploads/events/${req.file.filename}`,
          publicId: req.file.filename,
          contentType: req.file.mimetype
        } : event.media
      },
      { new: true, runValidators: true }
    );

    if (oldMediaPath) {
      await deleteFile(oldMediaPath);
    }

    res.status(StatusCodes.OK).json(updatedEvent);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating event',
      error: error.message
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Event not found'
      });
    }

    if (event.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Not authorized to delete this event'
      });
    }

    if (event.media?.publicId) {
      await deleteFile(`uploads/events/${event.media.publicId}`);
    }

    await Event.deleteOne({ _id: req.params.id });
    res.status(StatusCodes.OK).json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting event',
      error: error.message
    });
  }
};
