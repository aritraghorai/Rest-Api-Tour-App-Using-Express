const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour Must Have A Name'],
      unique: true,
      //*This is not useful is not in this case
      maxlength: [40, 'A tour Name max length of 40 Character'],
      minlength: [10, 'A tour Name min length of 10 Character'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour Must Have Duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must Have Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour Must Have Difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulity is only easy,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [, 'Rating is min 1'],
      max: [5.0, 'Rating is max 5'],
    },
    price: { type: Number, required: [true, 'A Tour Must Have A Price'] },
    priceDiscount: {
      type: Number,
      validate: {
        //*This Validator function is only valid only on inset,save function
        //*Because in mongoose this is point current object only on creating a new document
        validator: function (val) {
          return val < this.price;
        },
        message: 'PriceDiscount is ({VALUE}) grater than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour Must have summery'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour Must have a cover imgae'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    //*Location For The Tour
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    //*All Locations
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //* Toor Guide
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//*This Is An Example of virtual property
//*Virtual Property Which is Calculate by the another field
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.index({ price: 1, retingAvg: 1 });

//* Virtual Property Propulate Review
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//*This an example of document middleware
//*This run before save or create comment not in insertMany
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//*This happens after save a document to databse
//*
tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
});
//* Query Middleware
//*This middleware works only on find query
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  //*This Is Now A Query Object
  this.find({ secretTour: { $ne: true } });
  next();
});
//*This Run after save to document only on find Query
tourSchema.post(/^find/, function (docs, next) {
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});
//*Agregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
