const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/user.model');
const AuthService = require('../services/auth.service');

exports.protect = async (req, res, next) => {
  try {
    req.user = await AuthService.authorizeRequest(req);
    next();
  } catch (error) {
    const { status, message } = AuthService.handleAuthError(error);
    return res.status(status).json({
      success: false,
      message
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
