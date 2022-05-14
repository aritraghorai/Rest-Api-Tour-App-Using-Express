const Tour = require('../Model/tourModel');
const ApiFeature = require('../Utils/apiFeature');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
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

exports.getAllTours = catchAsync(async (req, res, _next) => {
  const Feature = new ApiFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .pagination();
  const allTour = await Feature.query;
  //* query.sort().select().skip().limit()
  res.status(200).json({
    status: 'Success',
    length: allTour.length,
    data: {
      tours: allTour,
    },
  });
});

exports.addTour = catchAsync(async (req, res, _next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      tour: newTour,
    },
  });
});
exports.getTourByID = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  res.status(200).json({
    status: 'Success',
    data: {
      tour: tour,
    },
  });
});
exports.updateTour = catchAsync(async (req, res, _next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'Success',
    data: {
      tour: tour,
    },
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndRemove(req.params.id);
  res.status(204).json({
    status: 'Success',
    data: {
      tour: tour,
    },
  });
});
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
