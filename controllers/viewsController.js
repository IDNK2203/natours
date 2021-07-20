const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tour');

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

  // console.log(tour);
  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Login into your account' });
});
