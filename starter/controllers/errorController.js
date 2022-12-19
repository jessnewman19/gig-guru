const AppError = require('../utils/appError');

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendProductionError = (err, res) => {
  //Operational error, send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //Programming or unknown error, do not leak error details to client
    // console.error('ERROR', err);
    res.status(500).json({
      status: 'Error',
      message: 'Something went very wrong :/',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //NEED TO CREATE ERROR THAT IS A COPY OF ERR WITHOUT USING THE SPREAD OPERATOR
    if (err.name === 'CastError') err = handleCastErrorDb(err);
    if (err.code === 11000) err = handleDuplicateFieldsDb(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDb(err);
    sendProductionError(err, res);
  }
  next();
};
