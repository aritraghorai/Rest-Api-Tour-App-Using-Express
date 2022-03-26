const Tour = require('../Model/tourModel');
const ApiFeature = require('../Utils/apiFeature');
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

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'Error',
      err: error,
    });
  }
};
exports.addTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      err: error,
    });
  }
};
exports.getTourByID = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(201).json({
      status: 'Success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      err: error,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      err: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id, { new: true });
    res.status(204).json({
      status: 'Success',
      data: {
        tour: null,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      err: error,
    });
  }
};
//*Get Tour Details
//?Frist Agregation Pipeline
exports.getTourStates = async (_req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      err: error,
    });
  }
};
//*Get Monthly Tour Start Data
exports.getMounthyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'failed',
      err: err,
    });
  }
};
