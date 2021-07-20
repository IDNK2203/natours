const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, 'A tour must have a name'],
      required: true,
      trim: true,
      maxLength: [40, 'A tour must have a more 40 characters'],
      minLength: [10, 'A tour must have a least 10 characters']
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: 5,
      min: 1,
      // this function is called everytime this field value is set
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // only works for SAVE and CREATE method
        validator: function(val) {
          return val < this.price;
        },
        message: 'The discount price cannot be less than the actual price'
      }
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be either easy , medium and difficult'
      }
    },
    maxGroupSize: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      // embedded Geo JSON data
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: String
      }
    ],
    // guides: Array
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    ]
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

// builds a non-persistent virtual array of child docs ids
tourSchema.virtual('reviews', {
  ref: 'review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const promiseGuides = this.guides.map(async el => await User.findById(el));

//   this.guides = await Promise.all(promiseGuides);
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({ path: 'guides', select: '-updatePasswordAt -__v' });
  next();
});

// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
