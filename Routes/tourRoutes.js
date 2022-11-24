const express = require('express');

//!Import All The Handler Function for tour router
const {
  getAllTours,
  addTour,
  getTourByID,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStates,
  getMounthyPlan,
} = require('../Controller/tourController');

//!Import Auth Handler Function
const { protect, restrictTo } = require('../Controller/authController');

//!Import review Router For Route api/v1/tour/:id/review
const reviewRouter = require('../Routes/reviewRoutes');

//!Create Router Object for
const router = express.Router();

//!For Route api/v1/tour/:id/review
router.use('/:tourId/review', reviewRouter);

//!All Tour Routes
router.route('/tour-states').get(getTourStates);
router
  .route(
    protect,
    restrictTo(['admin', 'lead-guide', 'guide']),
    '/mounthly-plan/:year'
  )
  .get(getMounthyPlan);
router.route('/top-5-chep').get(aliasTopTours, getAllTours);
router.route('/').get(getAllTours).post(protect, addTour);
router
  .route('/:id')
  .get(getTourByID)
  .patch(protect, restrictTo(['admin', 'lead-guide']), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
