const Review = require('../models/review');
// const catchAsync = require('../utils/catchAsync');
const factoryController = require('../controllers/factoryControllers');

exports.checkForDocIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = factoryController.getAll(Review);

exports.getReview = factoryController.getOne(Review);

exports.createNewReview = factoryController.createOne(Review);

exports.deleteAReview = factoryController.deleteOne(Review);

exports.updateAReivew = factoryController.updateOne(Review);
// exports.getSingleReview = catchAsync(async ()=>{
//   const review = await Review.find()

//   res.status()
// })
