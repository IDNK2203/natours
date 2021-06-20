const router = require('express').Router();

const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch(
  '/updatepassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateme', authController.protect, userController.updateMe);
router.delete('/deleteme', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createNewUser);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(authController.protect, userController.deleteUser);
// .patch(authController.protect, userController.updateUser);

module.exports = router;
