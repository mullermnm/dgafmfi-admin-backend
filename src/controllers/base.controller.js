const { StatusCodes } = require('http-status-codes');
const AuthService = require('../services/auth.service');

class BaseController {
  constructor() {
    // Bind methods to ensure 'this' context
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
    this.checkAuthorization = this.checkAuthorization.bind(this);
  }

  async checkAuthorization(req) {
    try {
      return await AuthService.authorizeRequest(req);
    } catch (error) {
      const { status, message } = AuthService.handleAuthError(error);
      throw { status, message };
    }
  }

  handleSuccess(res, data, message = 'Success', statusCode = StatusCodes.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  handleError(res, error) {
    console.error('Controller error:', error);
    console.log('Error details:', error);
    
    // If it's a known error with status
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Duplicate field value entered'
      });
    }

    // Default server error
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = BaseController;
