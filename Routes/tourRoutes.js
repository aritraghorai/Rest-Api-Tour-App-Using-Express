const express = require('express');
const { route } = require('../app');

const router = express.Router();
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
// router.param('id', checkId);
router.route('/tour-states').get(getTourStates);
router.route('/mounthly-plan/:year').get(getMounthyPlan);
router.route('/top-5-chep').get(aliasTopTours, getAllTours);
router.route('/').get(getAllTours).post(addTour);
router.route('/:id').get(getTourByID).patch(updateTour).delete(deleteTour);

module.exports = router;
