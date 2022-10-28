const User = require('../Model/userModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const factoryHandler = require('./handlerFactory');

const filterObj = (obj, ...allowFilled) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowFilled.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

exports.creatUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    measssage: 'Not Yet Implemented Go To user/login',
  });
};
exports.updateUser = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password Update.Please Use /updatePassword',
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
  });
  res.status(500).json({ status: 'error', measssage: 'Not Yet Implemented' });
};
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password Update.Please Use /updatePassword',
        400
      )
    );
  }
  const filterBody = filterObj(req.body, 'name', 'email');
  //*Update User Document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  console.log(updateUser);
  res.status(200).json({
    status: 'success',
    data: updateUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findOneAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
  });
});

exports.getMe = (req, res, next) => {
  console.log(req.user);
  console.log('hi');
  req.params.id = req.user._id;
  next();
};

exports.getUsersById = factoryHandler.getOne(User);
exports.getAllUsers = factoryHandler.getAll(User);
exports.deleteUser = factoryHandler.deleteOne(User);
