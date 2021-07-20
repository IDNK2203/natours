const router = require('express').Router();
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authControllers');

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);

router.get('/tour/:slug', authController.protect, viewController.getTours);

router.get('/login', viewController.login);

module.exports = router;
