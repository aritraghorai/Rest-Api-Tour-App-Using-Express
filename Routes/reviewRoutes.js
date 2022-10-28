//*This File Contains All The Review Route
const express = require('express');
const authController = require('../Controller/authController');
const reviewController = require('../Controller/reviewControler');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/', reviewController.getAllReview);
router.post(
  '/',
  authController.restrictTo('user'),
  reviewController.setUserAndTourId,
  reviewController.addReview
);

router
  .route('/:id')
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .get(reviewController.getReviewById);

module.exports = router;
