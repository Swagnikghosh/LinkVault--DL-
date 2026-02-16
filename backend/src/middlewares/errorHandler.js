const AppError = require('../utils/appError');

const mapCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const mapDuplicateKey = (err) => {
  const value = err?.keyValue && Object.keys(err.keyValue).length ? JSON.stringify(err.keyValue) : 'duplicate value';
  return new AppError(`Duplicate field value: ${value}. Please use another value.`, 400);
};

const mapValidation = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data. ${messages.join('. ')}`, 400);
};

const mapJwtInvalid = () => new AppError('Invalid token. Please log in again.', 401);
const mapJwtExpired = () => new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  console.error(err);
  res.status(Number(err.statusCode)).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ status: err.status, message: err.message });
  } else {
    console.error('UNEXPECTED ERROR', err);
    res.status(500).json({ status: 'error', message: 'Something went wrong.' });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'CastError') err = mapCastError(err);
  if (err.code === 11000) err = mapDuplicateKey(err);
  if (err.name === 'ValidationError') err = mapValidation(err);
  if (err.name === 'JsonWebTokenError') err = mapJwtInvalid();
  if (err.name === 'TokenExpiredError') err = mapJwtExpired();

  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  } else {
    sendErrorDev(err, res);
  }
};
