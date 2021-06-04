const Tour = require('../models/tour');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// @ Tours Controllers

exports.aliase = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'ratingsAverage,name,price,duration';
  req.query.limit = '5';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  const apiQuery = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await apiQuery.query.exec();
  res.status(200).json({
    status: 'suscess',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.createNewTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'suscess',
    data: newTour
  });
});

exports.getATour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('tour not found', 404));
  }

  res.status(200).json({
    status: 'suscess',
    data: {
      tour
    }
  });
});

exports.updateATour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('tour not found', 404));
  }

  res.status(200).json({
    status: 'suscess',
    data: {
      tour
    }
  });
});

exports.deleteATour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('tour not found', 404));
  }

  res.status(204).json({
    status: 'suscess',
    data: null
  });
});

exports.getToursStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgrating: { $avg: '$ratingsAverage' },
        numratings: { $avg: '$ratingsQuantity' },
        numTour: { $sum: 1 },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { avgPrice: 1 } }
  ]);
  res.status(200).json({
    status: 'suscess',
    results: stats.length,
    data: stats
  });
});

// Buisness Problem
// What is the busiest month of the year

exports.monthlyStats = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const stats = await Tour.aggregate([
    { $unwind: { path: '$startDates' } },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tours: { $push: '$name' },
        numTours: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        numTours: 1,
        tours: 1
      }
    },
    { $sort: { numTours: -1 } }
  ]);
  res.status(200).json({
    status: 'suscess',
    results: stats.length,
    data: stats
  });
});
