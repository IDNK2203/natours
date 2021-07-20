const mongoose = require('mongoose');
const Tour = require('./tour');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true
    },
    rating: {
      type: Number,
      max: 5,
      min: 1
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must have a tour']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Review must have a user']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// calc average ratings and update tour docs
reviewSchema.statics.calcRatingsAverage = async function(tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        ratingsAvg: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].ratingsAvg,
      ratingsQuantity: stats[0].numRatings
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.7,
      ratingsQuantity: 0
    });
  }
};

// create a list of users and tour pair unique from the each review doc
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.post('save', function() {
  this.constructor.calcRatingsAverage(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  this.r.constructor.calcRatingsAverage(this.r.tour);
});

reviewSchema.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

const Review = mongoose.model('review', reviewSchema);

module.exports = Review;
