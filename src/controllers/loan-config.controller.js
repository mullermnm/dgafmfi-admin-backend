const { StatusCodes } = require('http-status-codes');
const LoanConfig = require('../models/loan-config.model');

exports.createLoanConfig = async (req, res) => {
  try {
    const config = new LoanConfig({
      ...req.body,
      createdBy: req.user.id
    });

    await config.save();
    res.status(StatusCodes.CREATED).json(config);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating loan configuration',
      error: error.message
    });
  }
};

exports.getAllLoanConfigs = async (req, res) => {
  try {
    const configs = await LoanConfig.find()
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username')
      .sort('-createdAt');
    res.status(StatusCodes.OK).json(configs);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching loan configurations',
      error: error.message
    });
  }
};

exports.getLoanConfigById = async (req, res) => {
  try {
    const config = await LoanConfig.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');
    
    if (!config) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Loan configuration not found'
      });
    }

    res.status(StatusCodes.OK).json(config);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching loan configuration',
      error: error.message
    });
  }
};

exports.updateLoanConfig = async (req, res) => {
  try {
    const config = await LoanConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Loan configuration not found'
      });
    }

    config.value = req.body.value;
    config.updatedBy = req.user.id;
    await config.save();

    res.status(StatusCodes.OK).json(config);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating loan configuration',
      error: error.message
    });
  }
};

exports.deleteLoanConfig = async (req, res) => {
  try {
    const config = await LoanConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Loan configuration not found'
      });
    }

    await config.deleteOne({_id: req.params.id});
    res.status(StatusCodes.OK).json({
      message: 'Loan configuration deleted successfully'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting loan configuration',
      error: error.message
    });
  }
};

// Utility endpoints for the loan calculator
exports.getPayDayMonths = async (req, res) => {
  try {
    const config = await LoanConfig.findOne({ configType: 'payday_months' });
    res.status(StatusCodes.OK).json(config ? config.value : { minMonth: 1, maxMonth: 3 });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching payday months configuration',
      error: error.message
    });
  }
};

exports.getServiceCharges = async (req, res) => {
  try {
    const config = await LoanConfig.find({ configType: 'service_charges' });
    console.log(config);

    // Map through the config array to extract the value property
    const serviceCharges = config.map(item => item.value);

    res.status(StatusCodes.OK).json(serviceCharges);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching service charges configuration',
      error: error.message
    });
  }
};

exports.getKihlotMaxAmount = async (req, res) => {
  try {
    const config = await LoanConfig.findOne({ configType: 'kihlot_max_amount' });
    res.status(StatusCodes.OK).json(config ? config.value : { maxAmount: 500000 });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching Kihlot maximum amount configuration',
      error: error.message
    });
  }
};

exports.getKihlotInterestRate = async (req, res) => {
  try {
    const config = await LoanConfig.findOne({ configType: 'kihlot_interest_rate' });
    res.status(StatusCodes.OK).json(config ? config.value : { rate: 18.5 });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching Kihlot interest rate configuration',
      error: error.message
    });
  }
};
