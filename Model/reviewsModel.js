const mongoose = require('mongoose');
const Tour = require('./tourModel');

//? Review /Rating /created At /ref to Tour /ref to User

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: 'string',
      required: [true, 'Review can not be Empty!'],
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating is min 1'],
      max: [5.0, 'Rating is max 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review Must Belong to Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review Must Belong to User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].averageRating,
    ratingsQuantity: stats[0].nRating,
  });
};
//Find By Id and Update
reviewSchema.post('save', function () {
  //*This is mean current review
  this.constructor.calcAverageRating(this.tour);
});
//FindByIdUpdate
//FindByIdDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //*Find currently process document
  this.r = await this.model.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.tour);
});

const review = mongoose.model('Review', reviewSchema);
module.exports = review;
