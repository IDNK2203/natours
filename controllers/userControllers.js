const User = require('./../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filteredUserData = (sentData, ...neededFields) => {
  const obj = {};
  Object.keys(sentData).forEach(ele => {
    if (neededFields.includes(ele)) {
      obj[ele] = sentData[ele];
    }
  });
  return obj;
};

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
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'sucess',
      users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'this route is not yet defined',
      error
    });
  }
};

exports.createNewUser = async (req, res) => {
  try {
    res.status(500).json({
      status: 'error',
      message: 'this route is not yet defined'
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined'
  });
};

// exports.updateUser = catchAsync(async (req, res, next) => {
//   // steps
//   // 1 check data sent to be updated
//   // 2 update valid data onlt
//   // 3 purify user data to be sent back
//   // 4 send back user data

//   if (req.body.password) {
//     return next(
//       new AppError(`This route does not update password pls visit this route`)
//     );
//   }

//   res.status(500).json({
//     status: 'error',
//     message: 'this route is not yet defined'
//   });
// });

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined'
  });
};
