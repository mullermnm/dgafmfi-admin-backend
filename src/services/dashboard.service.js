const News = require('../models/news.model');
const Event = require('../models/event.model');
const Gallery = require('../models/gallery.model');
const PageView = require('../models/pageview.model');

exports.getStatistics = async () => {
    try {
        const [totalNews, totalEvents, totalGalleryImages, totalViews] = await Promise.all([
            News.countDocuments(),
            Event.countDocuments(),
            Gallery.countDocuments(),
            PageView.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$views" }
                    }
                }
            ])
        ]);

        // Calculate percentages (comparing with last month)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [
            lastMonthNews,
            lastMonthEvents,
            lastMonthGallery,
            lastMonthViews
        ] = await Promise.all([
            News.countDocuments({ createdAt: { $lt: new Date(), $gte: lastMonth } }),
            Event.countDocuments({ createdAt: { $lt: new Date(), $gte: lastMonth } }),
            Gallery.countDocuments({ createdAt: { $lt: new Date(), $gte: lastMonth } }),
            PageView.aggregate([
                {
                    $match: {
                        createdAt: { $lt: new Date(), $gte: lastMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$views" }
                    }
                }
            ])
        ]);

        // Calculate percentage changes
        const calculatePercentage = (current, last) => {
            if (!last) return "+0%";
            const percentage = ((current - last) / last * 100).toFixed(0);
            return percentage > 0 ? `+${percentage}%` : `${percentage}%`;
        };

        const viewsTotal = totalViews[0]?.total || 0;
        const lastMonthViewsTotal = lastMonthViews[0]?.total || 0;

        return {
            news: {
                total: totalNews,
                percentage: calculatePercentage(totalNews, lastMonthNews)
            },
            events: {
                total: totalEvents,
                percentage: calculatePercentage(totalEvents, lastMonthEvents)
            },
            gallery: {
                total: totalGalleryImages,
                percentage: calculatePercentage(totalGalleryImages, lastMonthGallery)
            },
            views: {
                total: viewsTotal,
                percentage: calculatePercentage(viewsTotal, lastMonthViewsTotal)
            }
        };
    } catch (error) {
        console.error('Error in dashboard service:', error);
        throw error;
    }
};
