const { body, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: errors.array()
    });
  }
  next();
};

exports.newsValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be atleast 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be atleast 10 characters'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
  validate
];

exports.galleryValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be atleast 3 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  validate
];

exports.eventValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('date').isISO8601().toDate().withMessage('Invalid date'),
  body('organizer').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Organizer name must be between 2 and 100 characters'),
  validate
];

exports.authValidation = [
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];
