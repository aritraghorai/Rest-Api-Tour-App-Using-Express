const mongoose = require('mongoose');

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

const review = mongoose.model('Review', reviewSchema);
module.exports = review;
