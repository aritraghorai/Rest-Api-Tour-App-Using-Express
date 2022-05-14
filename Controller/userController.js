const User = require('../Model/userModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');

const filterObj = (obj, ...allowFilled) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowFilled.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

exports.getAllUsers = (req, res, next) => {
  res.status(500).json({ status: 'error', measssage: 'Not Yet Implemented' });
  //* TODO:
};
exports.creatUser = (req, res, next) => {
  res.status(500).json({ status: 'error', measssage: 'Not Yet Implemented' });
  //* TODO:
};
exports.getUsers = (req, res, next) => {
  res.status(500).json({ status: 'error', measssage: 'Not Yet Implemented' });
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
  //* TODO:
};
exports.deleteUser = (req, res, next) => {
  res.status(500).json({ status: 'error', measssage: 'Not Yet Implemented' });
  //* TODO:
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
  console.log(filterBody);
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
