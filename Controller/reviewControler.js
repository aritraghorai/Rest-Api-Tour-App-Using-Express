//*This File Contains all the review controllers function

const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const factoryHandler = require('./handlerFactory');
const Review = require('../Model/reviewsModel');
const { Router } = require('express');
//!Import Review Model

exports.setUserAndTourId = (req, res, next) => {
  req.body.tour = req.params.tourId;
  if (req.body.user) req.body.user = req.user._id;
  next();
};
exports.getAllReview = factoryHandler.getAll(Review);

exports.addReview = factoryHandler.createOne(Review);

exports.getReviewById = factoryHandler.getOne(Review);

exports.deleteReview = factoryHandler.deleteOne(Review);

exports.updateReview = factoryHandler.updateOne(Review);
