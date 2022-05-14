const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../Model/userModel');
const carchAsync = require('../Utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../Utils/appError');
const sentEmail = require('../Utils/email');

//*To Create Jwt Tokem
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const cookieOption = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  secure: true,
  httpOnly: true,
};
if (process.env.NODE_ENV !== 'production') {
  cookieOption.secure = false;
}
const createAndSentToken = (id, res) => {
  const token = signToken(id);
  res.cookie('jwt', token, cookieOption);
  res.status(201).json({
    status: 'Success',
    token,
  });
};
//*User SignUp Function
exports.signUp = carchAsync(async (req, res, _next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role ?? 'user',
  });
  //*Create Jwt Token for user
  createAndSentToken(newUser._id, res);
});

exports.login = carchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //*Check Email and password is exist
  if (!email || !password) {
    const newError = new AppError('Please Password and Email', 400);
    return next(newError);
  }
  //*User user exist and password is valid
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createAndSentToken(user._id, res);
});
exports.protect = carchAsync(async (req, res, next) => {
  //*Get Token check it is exist
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  }
  //*If Token is not exist
  if (!token) {
    return next(new AppError('You Are Not into Login! Please login', 401));
  }
  //*Vlidate Token if not verified through error
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //*Check user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(AppError('The user belonging to user does not exist', 401));
  }
  //*Check User Change password after jwt
  if (freshUser.changePassWordAfter(decoded.iat)) {
    return next(
      new AppError('User Has Change Password Recently Please Login Again', 401)
    );
  }
  //*Grand Access To Protected Route
  req.user = freshUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You Daon't Have Permission To Perform These Action", 403)
      );
    next();
  };
};
exports.forgotPassword = carchAsync(async (req, res, next) => {
  //*Get user Based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No User Found with the email address', 404));
  }
  //*Generate reset random token
  const resetToken = user.createPasswordResetToken();
  //*Here We Save The Document
  await user.save({ validateBeforeSave: false });
  //*Sent it back as email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/resetPassword/${resetToken}`;
  const message = `Forgot Password Submit a patch request with your new password and password confarm 
  to:${resetURL}.\n`;
  try {
    await sentEmail({
      email: user.email,
      subject: 'Your Password Reset Toekn(valid for 10 minite)',
      message: message,
    });
  } catch (error) {
    user.passwordResetToen = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error in the sending email,try again')
    );
  }

  res.status(200).json({
    status: 'Success',
    message: 'Token Sent to email',
  });
});
exports.resetPassword = carchAsync(async (req, res, next) => {
  //*Get User Based On Token
  const hashToeken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashToeken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //*If Token is not expire a check there is an user
  if (!user) {
    return next(new AppError('Toen is invalid or expires', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //*Update the changePasswordAt property for the user
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //*Log the user in,sent JWT
  createAndSentToken(user._id, res);
});
exports.updatePassword = carchAsync(async (req, res, next) => {
  //*Get The User
  const user = await User.findById(req.user._id).select('+password');
  //*Check The old Password is correct ot not
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError('You Have Enter Wrong Current Password', 401));
  }
  //*Change The Password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;
  await user.save();
  //*Login The User With new Password
  createAndSentToken(user._id, res);
});
