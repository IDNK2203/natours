const router = require('express').Router();
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authControllers');

router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTours);

router.get('/login', authController.isLoggedIn, viewController.login);

router.get('/me', authController.protect, viewController.getUserProfile);
module.exports = router;
