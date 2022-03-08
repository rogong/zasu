const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth');

router.post('/register', AuthController.createUser);
router.post('/login', AuthController.loginUser);
router.post('/req-reset-password', AuthController.ResetPassword);
router.post('/new-password', AuthController.NewPassword);
router.post('/valid-password-token', AuthController.ValidPasswordToken);


module.exports = router;