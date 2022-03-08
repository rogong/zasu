const express = require('express');
const router = express.Router();

const FriendController = require('../controllers/friends');

const AuthHelper = require('../Helpers/AuthHelpers');


router.post('/follow-user', AuthHelper.VerifyToken, FriendController.followUser);

router.post('/unfollow-user', AuthHelper.VerifyToken, FriendController.unFollowUser);

router.post('/mark/:id', AuthHelper.VerifyToken, FriendController.markNotification);

router.post('/mark-all', AuthHelper.VerifyToken, FriendController.markAllNotifications);

module.exports = router;