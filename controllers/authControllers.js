const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const createToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const sendTokenAndResData = async (res, statusCode, user) => {
  const token = await createToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY_DATE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'sucess',
    token,
    user
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  sendTokenAndResData(res, 201, newUser);
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  if (!email || !password) {
    return next(new AppError('please provide your email and passowrd', 400));
  }

  const user = await User.findOne({ email: email }).select('+password');

  if (!user) {
    return next(new AppError('This user does not exist', 401));
  }
  if (!(await user.passwordCheck(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  sendTokenAndResData(res, 201, user);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 check if token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError(
        'you are not loged in please log in to view this resource',
        401
      )
    );
  }
  // 2 verify token

  // check if token was issued by us
  // check token has expired
  // extrack token data
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // check if user still exist
  const incomingUser = await User.findById(decodedPayload.id);
  // console.log(incomingUser);
  if (!incomingUser)
    return next(new AppError('This user no longer exists', 401));
  // if password was changed after user login in (suspicious behaviour) user has to login again
  if (incomingUser.updatePasswordAtCheck(decodedPayload.iat))
    //change your account access key after resource access key was created
    return next(
      new AppError(' please log in again to  view this resource', 401)
    );
  // check if user has changed password since the token was issued
  req.user = incomingUser;
  next();
});

exports.restrict = (...roles) => {
  return (req, res, next) => {
    const rolesArr = Array.from(...roles);
    if (rolesArr.includes(req.user.role)) return next();
    next(new AppError('Access denied ,unauthorized user detected', 403));
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // steps

  // 1) get user email from post request
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('This user does not exist', 404));

  // 2) create random reset password token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) send token back to user
  const resetUrl = `${req.protocol}//${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password ? submit a PaTCH request with your new password and confirmPassword 
  to this url${resetUrl}.\nIf you didn,t forget your password pleas ignore this email.`;

  try {
    await sendEmail({
      message,
      subject: 'Your password reset only valid for 10mins',
      email: user.email
    });
    res.status(200).json({
      status: 'sucess',
      message: 'your password reset token has been sent to your email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.tokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'An error occured during the email send operation , please try again later',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // steps
  const enIncomingToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 3) check if token timestamp and compare with tokenExpiresAt

  const user = await User.findOne({
    passwordResetToken: enIncomingToken,
    tokenExpiresAt: { $gte: Date.now() }
  });

  if (!user)
    return next(
      new AppError('This is an invalid reset token or token has expired ', 404)
    );

  // 4) reset user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 5) delete tokenExpiresAt value from dataBase
  user.passwordResetToken = undefined;
  user.tokenExpiresAt = undefined;
  await user.save();

  // update passwordUpdateAt to current time

  // login user
  sendTokenAndResData(res, 201, user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // steps

  // 1)confirm user password
  const loginUser = await User.findOne({ _id: req.user.id }).select(
    '+password'
  );

  if (!(await loginUser.passwordCheck(req.body.password, loginUser.password)))
    return next(
      new AppError('please provide your correct current password', 401)
    );

  //set new password
  loginUser.password = req.body.newPassword;
  loginUser.passwordConfirm = req.body.newPasswordConfirm;
  await loginUser.save();

  sendTokenAndResData(res, 201, loginUser);
});

// send mutated user data back to client or delete password key value pair
