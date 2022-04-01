//*For Controling Error
const AppError = require('../Utils/appError');

const sentErrorDev = (err, res) => {
  console.log(err.stack);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sentErrorProd = (err, res) => {
  if (err.isOperational)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  else
    res.status(500).json({
      status: 'Error',
      message: 'Something Happen Very Wrong',
    });
};
//*This Method for handle cast errror
const handleCaseError = (err) => {
  const message = `Invalid ${err.kind}:${err.value}`;
  return new AppError(message, 400);
};
//*This Method for handle duplicate entry
const handleDuplicateFieldsDb = (err) => {
  const message = `Duplicate field value ${err.keyValue.name}`;
  return new AppError(message, 400);
};
//*This is for field validation error
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((item) => {
    return item.message;
  });
  const message = `Invlid Inpur Data ${errors.join('.')}`;
  return new AppError(message, 400);
};
module.exports = (err, _req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'devolopment') {
    sentErrorDev(err, res);
  } else {
    //*Mongose find method object error
    //*reference:https://github.com/Automattic/mongoose/issues/5354

    let error = { ...err };
    if (err.name === 'CastError' || err.name === 'BSONTypeError') {
      error = handleCaseError(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsDb(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    sentErrorProd(error, res);
  }

  next();
};
