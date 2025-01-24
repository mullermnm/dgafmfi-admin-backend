const { StatusCodes } = require('http-status-codes');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const AuthService = require('../services/auth.service');

const generateToken = (id) => {
  console.log('[Token] Generating token for user:', id);
  const token = jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
  console.log('[Token] Generated token:', token.substring(0, 20) + '...');
  return token;
};

exports.register = async (req, res) => {
  try {
    console.log('[Register] Attempting to register user:', req.body);
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.log('[Register] User already exists:', email);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    console.log('[Register] User created successfully:', user._id);
    const token = generateToken(user._id);

    res.status(StatusCodes.CREATED).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('[Register] Error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('[Login] Login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[Login] Missing credentials');
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const { user, token } = await AuthService.authenticate(email, password);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log('[Login] Login successful:', user._id);
    res.status(StatusCodes.OK).json({
      success: true,
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('[Login] Error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    if (error.message === 'Invalid credentials') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    console.log('[GetMe] Getting user profile:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    res.status(StatusCodes.OK).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[GetMe] Error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
