const rateLimit = require('express-rate-limit');
const {formatResponse} = require('./errorHandler');

/**
 * Creates a rate limiter middleware with configurable options
 * @param {Object} options - Configuration options for the rate limiter
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.limit - Maximum number of requests allowed in the time window
 * @param {string} options.message - Error message to display when rate limit is exceeded
 * @returns {Function} Express middleware function
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  limit = 5,
  message = 'Too many requests, please try again later',
}) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json(formatResponse(false, message));
    },
    // Use IP address as key by default
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
  });
};

// Pre-configured rate limiters for common use cases
const rateLimiters = {
  login: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    message: 'Too many login attempts, please try again later',
  }),

  passwordReset: createRateLimiter({
    windowMs: 30 * 60 * 1000, // 30 minutes
    limit: 1,
    message: 'Too many password reset requests, please try again 30 min later',
  }),

  otpVerification: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    message: 'Too many OTP verification attempts, please try again later',
  }),

  passwordChange: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 3,
    message: 'Too many password change attempts, please try again later',
  }),
};

module.exports = {
  createRateLimiter,
  rateLimiters,
}; 
