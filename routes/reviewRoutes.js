const router = require('express').Router({ mergeParams: true });
const reviewController = require('../controllers/reviewControllers');
const authController = require('../controllers/authControllers');

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrict(['user']),
    reviewController.checkForDocIds,
    reviewController.createNewReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrict(['user', 'admin']),
    reviewController.deleteAReview
  )
  .patch(
    authController.restrict(['user', 'admin']),
    reviewController.updateAReivew
  );

module.exports = router;
