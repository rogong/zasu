const express = require('express');
const router = express.Router();

const MessageController = require('../controllers/message');

const AuthHelper = require('../Helpers/AuthHelpers');


router.get('/chat-messages/:sender_Id/:receiver_Id',
    AuthHelper.VerifyToken,
    MessageController.getAllMessages);

router.post('/chat-messages/:sender_Id/:receiver_Id', AuthHelper.VerifyToken, MessageController.sendMessage);

module.exports = router;