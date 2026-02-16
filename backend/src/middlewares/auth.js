const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { constants } = require('../utils/constants');

const digestSession = (value) =>
  crypto.createHash('sha256').update(value).digest('hex');

// exported for reuse in auth controller if needed
exports.hashSessionToken = digestSession;

exports.protect = asyncHandler(async (req, res, next) => {
  const sessionCookie = req.cookies?.jwt;

  if (!sessionCookie) {
    return next(new AppError('Please log in to continue', constants.UNAUTHORIZED));
  }

  let decodedPayload;
  try {
    decodedPayload = jwt.verify(sessionCookie, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired session', constants.UNAUTHORIZED));
  }

  const user = await User.findById(decodedPayload.id).select('+sessionTokenHash');
  if (!user) {
    return next(new AppError('User no longer exists', constants.UNAUTHORIZED));
  }

  if (!decodedPayload.sessionToken || !user.sessionTokenHash) {
    return next(new AppError('Invalid session. Please log in again', constants.UNAUTHORIZED));
  }

  const incomingHash = digestSession(decodedPayload.sessionToken);
  if (incomingHash !== user.sessionTokenHash) {
    return next(new AppError('Session expired. Please log in again', constants.UNAUTHORIZED));
  }

  req.user = user;
  next();
});
