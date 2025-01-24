const News = require('../models/news.model');
const Event = require('../models/event.model');
const Gallery = require('../models/gallery.model');
const PageView = require('../models/pageview.model');
const dashboardService = require('../services/dashboard.service');

exports.getStatistics = async (req, res) => {
    try {
        const stats = await dashboardService.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};
