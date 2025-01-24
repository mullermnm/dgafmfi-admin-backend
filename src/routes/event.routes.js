const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadMedia } = require('../middleware/upload.middleware');
const { eventValidation } = require('../middleware/validator.middleware');

router.route('/')
  .get(getAllEvents)
  .post(protect, authorize('admin'), uploadMedia.single('media'), eventValidation, createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('admin'), uploadMedia.single('media'), eventValidation, updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

module.exports = router;
