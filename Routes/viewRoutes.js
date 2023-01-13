const express = require('express');

const router = express.Router();
const viewController = require('../Controller/viewController');

router.get('/', (req, res) => {
  res.status(200).render('base', { tour: 'Forest Hiker', user: 'Jonas' });
});
router.get('/overview', viewController.getOverview);
router.get('/tour/:slug', viewController.getTourDetail);

module.exports = router;
