const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { StatusCodes } = require('http-status-codes');

class AuthService {
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  static generateToken(user) {
    console.info(process.env.JWT_SECRET);
    return jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static async authenticate(email, password) {
    try {
      const user = await User.findOne({ email });
      console.log(user);
      if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }
      
      const token = this.generateToken(user);
      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  static async authorizeRequest(req) {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new Error('No token provided');
    }

    return this.verifyToken(token);
  }

  static handleAuthError(error) {
    console.error('Auth error:', error.message);
    switch (error.message) {
      case 'No token provided':
      case 'invalid signature':
      case 'jwt malformed':
      case 'jwt expired':
      case 'invalid token':
        return {
          status: StatusCodes.UNAUTHORIZED,
          message: 'Not authorized to access this route'
        };
      case 'User not found':
        return {
          status: StatusCodes.UNAUTHORIZED,
          message: 'User no longer exists'
        };
      default:
        return {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Server error in authentication'
        };
    }
  }
}

module.exports = AuthService;
