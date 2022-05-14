const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  creatUser,
  getUsers,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../Controller/userController');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
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
router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);
router.route('/').get(getAllUsers).post(creatUser);
router.route('/:id').get(getUsers).patch(updateUser).delete(deleteUser);

module.exports = router;
