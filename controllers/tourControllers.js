const Tour = require('../models/tour');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factoryController = require('../controllers/factoryControllers');
// @ Tours Controllers

exports.aliase = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'ratingsAverage,name,price,duration';
  req.query.limit = '5';
  next();
};

exports.getAllTours = factoryController.getAll(Tour);

exports.createNewTour = factoryController.createOne(Tour);

exports.getATour = factoryController.getOne(Tour, 'review');

exports.updateATour = factoryController.updateOne(Tour);

exports.deleteATour = factoryController.deleteOne(Tour);

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getToursDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        // distances is usually in meters
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: tours
    }
  });
});
