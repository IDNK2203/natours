const User = require('./../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factoryController = require('../controllers/factoryControllers');

const filteredUserData = (sentData, ...neededFields) => {
  const obj = {};
  Object.keys(sentData).forEach(ele => {
    if (neededFields.includes(ele)) {
      obj[ele] = sentData[ele];
    }
  });
  return obj;
};

exports.getMe = factoryController.getOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  // steps
  // 1 check data sent to be updated
  // send error if user tries to update password
  // 2 filter out relevant data
  // 3 update user data
  // 4 send back updated user data

  // others functionalities
  // check if user data send relevant data and send back error message

  if (req.body.password || req.body.passwordConfirm) {
    const updatePasswordURL = `${req.protocol}//${req.get(
      'host'
    )}/api/v1/users/updatepassword`;
    return next(
      new AppError(
        `This route does not update password pls visit this route ${updatePasswordURL}`,
        400
      )
    );
  }

  // test for proper filtering of sendData [_/]
  const filteredObj = filteredUserData(req.body, 'name', 'email');

  // test if doc is gets updated  [_/]
  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    // test for invalid data  [_/]
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    user
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    {
      runValidators: true
    }
  );
  res.status(204).json({
    status: 'success',
    message: 'Your accounted has been deleted.'
  });
});

// @ Users Controllers
exports.createNewUser = factoryController.createOne(User);
exports.getAllUser = factoryController.getAll(User);
exports.getUser = factoryController.getOne(User);
exports.deleteUser = factoryController.deleteOne(User);
exports.updateUser = factoryController.updateOne(User);
