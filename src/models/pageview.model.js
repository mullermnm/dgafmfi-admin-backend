const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PageView', pageViewSchema);
