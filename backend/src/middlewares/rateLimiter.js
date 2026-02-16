const rateLimit = require('express-rate-limit');

const throttleGuard = rateLimit({
  max: 1000, // max requests per window
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = throttleGuard;
