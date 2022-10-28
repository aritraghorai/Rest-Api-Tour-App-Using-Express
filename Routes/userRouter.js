const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  creatUser,
  getUsersById,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../Controller/userController');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../Controller/authController');
/*
!Create a checkbody middleware
! Check weather body contains name and price property
! if not then,sent back 400(bad request)
! Add it to post(/) handler
*/

//*For SignUp Post Request Route
router.post('/signup', signUp);
//*For user login router
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//*Protect All after this middleware
router.use(protect);

router.get('/me', getMe, getUsersById);
router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

//*After this all route reserve for admin
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(creatUser);
router.route('/:id').get(getUsersById).patch(updateUser).delete(deleteUser);

module.exports = router;
