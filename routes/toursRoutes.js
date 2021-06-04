const router = require('express').Router();

const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authControllers');

// router.param('id', tourController.checkId);

router
  .route('/top-5-cheap')
  .get(tourController.aliase, tourController.getAllTours);

router.route('/stats').get(tourController.getToursStats);

router.route('/monthly-stats/:year').get(tourController.monthlyStats);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createNewTour);
router
  .route('/:id')
  .get(tourController.getATour)
  .delete(
    authController.protect,
    authController.restrict(['lead-guide', 'admin']),
    tourController.deleteATour
  )
  .patch(tourController.updateATour);

module.exports = router;
