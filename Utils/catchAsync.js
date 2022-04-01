const AppError = require('../Utils/appError');
//*This is an wrapper function to catch error from asynccronus function
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
module.exports = catchAsync;
