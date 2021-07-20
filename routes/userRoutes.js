const router = require('express').Router();

const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatepassword', authController.updatePassword);
router.patch('/updateme', userController.updateMe);
router.delete('/deleteme', userController.deleteMe);
router.route('/me').get(userController.setUserId, userController.getMe);

router
  .route('/')
  .get(userController.getAllUser)
  .post(authController.restrict(['admin']), userController.createNewUser);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(authController.restrict(['admin']), userController.deleteUser)
  .patch(authController.restrict(['admin']), userController.updateUser);

module.exports = router;
