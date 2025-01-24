const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authValidation } = require('../middleware/validator.middleware');

router.post('/register', authValidation, register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
