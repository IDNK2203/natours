const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('This document could be not found', 404));
    }

    res.status(204).json({
      status: 'suscess',
      data: null
    });
  });

exports.updateOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('document not found', 404));
    }

    res.status(200).json({
      status: 'suscess',
      data: {
        doc
      }
    });
  });

exports.createOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

exports.getOne = (model, populateOpts) =>
  catchAsync(async (req, res, next) => {
    const query = model.findById(req.params.id);

    if (populateOpts) query.populate(populateOpts);
    const doc = await query;
    if (!doc) {
      return next(new AppError('doc not found', 404));
    }

    res.status(200).json({
      status: 'suscess',
      data: {
        doc
      }
    });
  });

exports.getAll = model =>
  catchAsync(async (req, res) => {
    // hack for nested review on route
    const filter = req.query;
    if (req.params.tourId) filter.tour = req.params.tourId;
    //
    const apiQuery = new APIFeatures(model.find(), filter)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await apiQuery.query.exec();
    res.status(200).json({
      status: 'suscess',
      results: doc.length,
      data: {
        doc
      }
    });
  });

// exports.getATour =catchAsync(async (req, res, next) => {
//   const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   if (!doc) {
//     return next(new AppError('document not found', 404));
//   }

//   res.status(200).json({
//     status: 'suscess',
//     data: {
//       doc
//     }
//   });
// });

// exports.deleteATour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('tour not found', 404));
//   }

//   res.status(204).json({
//     status: 'suscess',
//     data: null
//   });
// });
