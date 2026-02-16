const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { constants } = require('../utils/constants');
const { hashSessionToken } = require('../middlewares/auth');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: Number(process.env.JWT_COOKIE_EXPIRES_IN_DAYS || 7) * 24 * 60 * 60 * 1000,
});

const signToken = (id, sessionToken) =>
  jwt.sign({ id, sessionToken }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendAuthResponse = async (user, statusCode, res) => {
  const rawSessionToken = crypto.randomBytes(32).toString('hex');
  user.sessionTokenHash = hashSessionToken(rawSessionToken);
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id.toString(), rawSessionToken);
  res.cookie('jwt', token, cookieOptions());

  res.status(statusCode).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
  });
};

exports.signup = asyncHandler(async (req, res, next) => {
  const { name, password, confirmPassword } = req.body;
  const email = req.body.email?.toLowerCase().trim();

  if (!name || !email || !password || !confirmPassword) {
    return next(new AppError('All fields are required', constants.VALIDATION_ERROR));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', constants.VALIDATION_ERROR));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', constants.VALIDATION_ERROR));
  }

  const user = await User.create({ name, email, password });
  await sendAuthResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email?.toLowerCase().trim();

  if (!email || !password) {
    return next(new AppError('Email and password are required', constants.VALIDATION_ERROR));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', constants.UNAUTHORIZED));
  }

  await sendAuthResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(decoded.id, { sessionTokenHash: null });
    } catch (err) {
      // Ignore expired or malformed token on logout
    }
  }

  res.cookie('jwt', 'logged-out', {
    ...cookieOptions(),
    maxAge: 1000,
  });

  res.status(200).json({
    status: 'success',
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(200).json({
      status: 'success',
      data: {
        authenticated: false,
        user: null,
      },
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(200).json({
      status: 'success',
      data: {
        authenticated: false,
        user: null,
      },
    });
  }

  const user = await User.findById(decoded.id).select('+sessionTokenHash');
  if (!user || !decoded.sessionToken || !user.sessionTokenHash) {
    return res.status(200).json({
      status: 'success',
      data: {
        authenticated: false,
        user: null,
      },
    });
  }

  if (hashSessionToken(decoded.sessionToken) !== user.sessionTokenHash) {
    return res.status(200).json({
      status: 'success',
      data: {
        authenticated: false,
        user: null,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('All fields are required', constants.VALIDATION_ERROR));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('New passwords do not match', constants.VALIDATION_ERROR));
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', constants.UNAUTHORIZED));
  }

  user.password = newPassword;
  await user.save();

  await sendAuthResponse(user, 200, res);
});
