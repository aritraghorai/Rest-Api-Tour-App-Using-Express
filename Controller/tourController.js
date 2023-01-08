const Tour = require('../Model/tourModel');
const ApiFeature = require('../Utils/apiFeature');
const factoryHandler = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
//*Check id middleware
// exports.checkId = (req, res, next, val) => {
//   if (tours[tours.length - 1].id < val) {
//     return res.status(404).json({ status: 'fail', error: 'id invald' });
//   }
//   next();
// };

//*Top 5 Tour Alias Function
exports.aliasTopTours = (req, _res, next) => {
  req.query.limit = '5';
  req.query.sort = '-retingAvg,price';
  req.query.fields = 'name,price,retingAvg,summery,difficulty';
  next();
};

exports.getAllTours = factoryHandler.getAll(Tour);

exports.addTour = factoryHandler.createOne(Tour);

exports.getTourByID = factoryHandler.getOne(Tour, { path: 'reviews' });
// exports.updateTour = catchAsync(async (req, res, _next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(201).json({
//     status: 'Success',
//     data: {
//       tour: tour,
//     },
//   });
// });
exports.updateTour = factoryHandler.updateOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndRemove(req.params.id);
//   res.status(204).json({
//     status: 'Success',
//     data: {
//       tour: tour,
//     },
//   });
// });
//!Using Factory Function
exports.deleteTour = factoryHandler.deleteOne(Tour);

//*Get Tour Details
//?Frist Agregation Pipeline
exports.getTourStates = catchAsync(async (_req, res, _next) => {
  //*This Is Agregation Pipeline
  const states = await Tour.aggregate([
    {
      $match: { retingAvg: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numberOfTour: { $sum: 1 },
        numberOfRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$retingAvg' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      states: states,
    },
  });
});
//*Get Monthly Tour Start Data
exports.getMounthyPlan = catchAsync(async (req, res, _next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numberOfTourStart: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numberOfTourStart: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new AppError('Please provide in the for mar of lat,lng', 400));
  }
  const radious = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radious] } },
  });
  res.status(300).json({
    status: 'ok',
    data: tour,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new AppError('Please provide in the for mar of lat,lng', 400));
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: 0.001,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(300).json({
    status: 'ok',
    data: distances,
  });
});
