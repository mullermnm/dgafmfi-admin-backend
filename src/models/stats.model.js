const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  moneyAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  productCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure there's only one stats document
statsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      throw new Error('Only one stats document can exist');
    }
  }
  next();
});

const Stats = mongoose.model('Stats', statsSchema);

module.exports = Stats;
