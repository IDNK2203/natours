const router = require('express').Router();

const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authControllers');
const reviewRoutes = require('../routes/reviewRoutes');

router.use('/:tourId/reviews', reviewRoutes);

router
  .route('/top-5-cheap')
  .get(tourController.aliase, tourController.getAllTours);

router.route('/stats').get(tourController.getToursStats);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getToursDistances);

router
  .route('/monthly-stats/:year')
  .get(
    authController.protect,
    authController.restrict(['lead-guide', 'admin']),
    tourController.monthlyStats
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrict(['lead-guide', 'admin']),
    tourController.createNewTour
  );
router
  .route('/:id')
  .get(tourController.getATour)
  .delete(
    authController.protect,
    authController.restrict(['lead-guide', 'admin']),
    tourController.deleteATour
  )
  .patch(
    authController.protect,
    authController.restrict(['lead-guide', 'admin']),
    tourController.updateATour
  );

module.exports = router;
