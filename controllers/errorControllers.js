const AppError = require('./../utils/appError');

const sendDevErrors = (err, res) => {
  // console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendProdErrors = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // console.error('Error : 💥', err);
    res.status(500).json({
      status: 'Error',
      message: 'Something went very wrong'
    });
  }
};

const handleDuplicateFieldsDB = err => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const invalidTokenError = () => {
  return new AppError(
    'invalid token detected , please try logging in again.',
    401
  );
};

const expiredTokenError = () => {
  return new AppError(
    'expired token detected , please try logging in again.',
    401
  );
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevErrors(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // console.log(error);
    if (error.name === 'JsonWebTokenError') error = invalidTokenError(error);
    if (error.name === 'TokenExpiredError') error = expiredTokenError(error);

    sendProdErrors(error, res);
  }
};
