const AppError = require('./AppError');
const mongoose = require('mongoose');

/**
 * Format response object
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {object} data - Optional data to include in response
 * @returns {object} Formatted response object
 */
const formatResponse = (success, message, data = null) => {
  const response = {
    success,
    message
  };

  if (data) {
    response.data = data;
  }

  return response;
};

/**
 * Handle MongoDB duplicate key errors
 * @param {Error} err - MongoDB error
 * @returns {AppError} - Formatted AppError
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${value} for field ${field}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose validation errors
 * @param {Error} err - Mongoose validation error
 * @returns {AppError} - Formatted AppError
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 * @param {Error} err - JWT error
 * @returns {AppError} - Formatted AppError
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

/**
 * Handle JWT expired errors
 * @returns {AppError} - Formatted AppError
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

/**
 * Handle Redis errors
 * @param {Error} err - Redis error
 * @returns {AppError} - Formatted AppError
 */
const handleRedisError = (err) => {
  return new AppError(`Redis error: ${err.message}`, 500);
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {object} res - Express response object
 */
const handleError = (err, res) => {
  console.error('ERROR ', err);

  // Already an AppError, just send response
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      formatResponse(false, err.message)
    );
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const appError = handleDuplicateKeyError(err);
    return res.status(appError.statusCode).json(
      formatResponse(false, appError.message)
    );
  }

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const appError = handleValidationError(err);
    return res.status(appError.statusCode).json(
      formatResponse(false, appError.message)
    );
  }

  // Mongoose CastError (invalid ID)
  if (err instanceof mongoose.Error.CastError) {
    const message = `Invalid ${err.path}: ${err.value}.`;
    const appError = new AppError(message, 400);
    return res.status(appError.statusCode).json(
      formatResponse(false, appError.message)
    );
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    const appError = handleJWTError();
    return res.status(appError.statusCode).json(
      formatResponse(false, appError.message)
    );
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    const appError = handleJWTExpiredError();
    return res.status(appError.statusCode).json(
      formatResponse(false, appError.message)
    );
  }

  // Redis Error (checking if error message contains 'redis')
  if (err.message && err.message.toLowerCase().includes('redis')) {
    const appError = handleRedisError(err);
    return res.status(appError.statusCode).json(
      formatResponse(false, appError.message)
    );
  }

  // Default error handler for unhandled errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  res.status(statusCode).json(
    formatResponse(false, process.env.NODE_ENV === 'development' ? message : 'Something went wrong')
  );
};

module.exports = {
  formatResponse,
  handleError,
  AppError
}; 