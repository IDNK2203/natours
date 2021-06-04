const User = require('./../models/user');

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

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined'
  });
};
