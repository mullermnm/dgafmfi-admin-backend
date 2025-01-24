const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');
const { protect } = require('../middleware/auth.middleware');

const statsController = new StatsController();

router.get('/', protect, statsController.getStats);
router.patch('/', protect, statsController.updateStats);

module.exports = router;
