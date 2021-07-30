const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tour');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTours = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate(
    'reviews'
  );
  if (!tour) {
    return next(new AppError('This tour could not be found', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Login into your account' });
});

exports.getUserProfile = catchAsync(async (req, res, next) => {
  res.status(200).render('userAccount', {
    title: req.user.name,
    user: req.user
  });
});
