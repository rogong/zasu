const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users');

const AuthHelper = require('../Helpers/AuthHelpers');


router.get('/users', AuthHelper.VerifyToken, UserController.getAllUsers);
router.get('/recommended-users', AuthHelper.VerifyToken, UserController.getRecommendedUsers);
router.get('/user/:id', AuthHelper.VerifyToken, UserController.getUser);
router.get('/username/:username', AuthHelper.VerifyToken, UserController.getUserByUserName);
router.post('/user/view-profile', AuthHelper.VerifyToken, UserController.profileView);
router.post('/change-password', AuthHelper.VerifyToken, UserController.changePassword);


module.exports = router;