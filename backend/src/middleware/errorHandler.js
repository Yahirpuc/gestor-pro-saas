const { ValidationError, UniqueConstraintError } = require('sequelize');

class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation error';
    details = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'Resource already exists';
    details = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (statusCode >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: { message, details },
  });
};

module.exports = { ApiError, notFound, errorHandler };
