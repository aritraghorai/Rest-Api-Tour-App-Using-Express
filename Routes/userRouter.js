const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  creatUser,
  getUsers,
  updateUser,
  deleteUser,
} = require('../Controller/userController');
/*
!Create a checkbody middleware
! Check weather body contains name and price property
! if not then,sent back 400(bad request)
! Add it to post(/) handler
*/

router.route('/').get(getAllUsers).post(creatUser);
router.route('/:id').get(getUsers).patch(updateUser).delete(deleteUser);

module.exports = router;
