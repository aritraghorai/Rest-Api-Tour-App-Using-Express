const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const ApiFeature = require('../Utils/apiFeature');

//!Delete Handler Function
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndRemove(req.params.id);
    if (!doc) {
      return next(new AppError('No Document Find For The Id', 404));
    }
    res.status(204).json({
      status: 'Success',
      data: {
        doc: null,
      },
    });
  });

//*Update Tour Handler Function
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No Document Found', 404));
    }
    res.status(201).json({
      status: 'Success',
      data: { data: doc },
    });
  });

//*CreateOne Handler Function
exports.createOne = (Model) =>
  catchAsync(async (req, res, _next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        data: newDoc,
      },
    });
  });
//*GetOne Handler Function
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('No Document Found', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, _next) => {
    //!Handle Router /api/:tourId/review route
    let filter = {};
    //*Check for Tour Id
    const tourId = req.params.tourId;
    //!Handle Router /api/review route
    if (tourId) {
      filter = { tour: tourId };
    }
    const Feature = new ApiFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitField()
      .pagination();
    const docs = await Feature.query;
    //* query.sort().select().skip().limit()
    res.status(200).json({
      status: 'Success',
      length: docs.length,
      data: {
        data: docs,
      },
    });
  });
