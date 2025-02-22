const mongoose = require('mongoose');

const loanConfigSchema = new mongoose.Schema({
  configType: {
    type: String,
    required: true,
    enum: ['payday_months', 'service_charges', 'kihlot_max_amount', 'kihlot_interest_rate']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoanConfig', loanConfigSchema);
