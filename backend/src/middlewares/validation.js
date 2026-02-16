const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const AppError = require('../utils/appError');
const Item = require('../models/itemModel');
const { constants } = require('../utils/constants');

const verifyPasswordHash = async (storedHash, incomingPwd) => bcrypt.compare(incomingPwd, storedHash);

exports.valCheck = asyncHandler(async (req, res, next) => {
  const itemId = req.params.id;
  const suppliedPassword = req.query.password;
  const flagProtected = req.query.isProtected;

  const doc = await Item.findById(itemId).select('+password');
  if (!doc) {
    return next(new AppError('Link is invalid or expired!', constants.NOT_FOUND));
  }

  const pathIsFile = req.originalUrl.includes('/file/');
  const pathIsText = req.originalUrl.includes('/plainText/');
  const docIsFile = doc.isText === 'false';
  const docIsText = doc.isText === 'true';

  if ((pathIsText && !docIsText) || (pathIsFile && !docIsFile)) {
    return next(new AppError('Link is invalid or expired!', constants.NOT_FOUND));
  }

  const locked = Boolean(doc.password);

  if (!flagProtected && locked) {
    return next(new AppError('Link is invalid or expired!', constants.NOT_FOUND));
  }

  if (locked && !suppliedPassword) {
    return next(new AppError('Password required', constants.UNAUTHORIZED));
  }

  if (locked && !(await verifyPasswordHash(doc.password, suppliedPassword))) {
    return next(new AppError('Incorrect password!', constants.UNAUTHORIZED));
  }

  if (doc.viewsLeft !== null) {
    if (doc.viewsLeft <= 0) {
      return next(new AppError('View limit reached', constants.FORBIDDEN));
    }

    await Item.findByIdAndUpdate(doc._id, { $inc: { viewsLeft: -1 } });
  }

  req.doc = doc;
  next();
});

