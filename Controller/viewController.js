const Tour = require('../Model/tourModel');
const catchAsync = require('../Utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //*1)Get tour data from collection
  const tours = await Tour.find({});
  res.status(200).render('overview', {
    data: tours,
  });
});

exports.getTourDetail = catchAsync(async (req, res, next) => {
  //1)Get The data,for the reqest tour(including reviews and guide)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating',
  });
  //2)Build templete

  res.status(200).render('tour', {
    tour,
  });
});
