const { StatusCodes } = require('http-status-codes');

const validatePaydayMonths = (value) => {
  if (!value.minMonth || !value.maxMonth) {
    return false;
  }
  return value.minMonth <= value.maxMonth;
};

const validateServiceCharges = (value) => {
  if (!Array.isArray(value)) return false;
  return value.every(charge => 
    charge.minimumAmount &&
    charge.maximumAmount &&
    charge.serviceCharge &&
    charge.minimumAmount <= charge.maximumAmount
  );
};

const validateKihlotMaxAmount = (value) => {
  return value.maxAmount && value.maxAmount > 0;
};

const validateKihlotInterestRate = (value) => {
  return value.rate && value.rate > 0;
};

exports.loanConfigValidation = (req, res, next) => {
  const { configType, value } = req.body;

  if (!configType || !value) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Configuration type and value are required'
    });
  }

  let isValid = false;
  switch (configType) {
    case 'payday_months':
      isValid = validatePaydayMonths(value);
      break;
    case 'service_charges':
      isValid = validateServiceCharges(value);
      break;
    case 'kihlot_max_amount':
      isValid = validateKihlotMaxAmount(value);
      break;
    case 'kihlot_interest_rate':
      isValid = validateKihlotInterestRate(value);
      break;
    default:
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid configuration type'
      });
  }

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Invalid configuration value format'
    });
  }

  next();
};
