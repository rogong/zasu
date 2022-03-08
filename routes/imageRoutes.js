const express = require('express');
const router = express.Router();

const ImageController = require('../controllers/image');
const AuthHelper = require('../Helpers/AuthHelpers');

router.get('/set-default-image/:imgId/:imgVersion', AuthHelper.VerifyToken, ImageController.setDefaultImage);
router.post('/upload-image', AuthHelper.VerifyToken, ImageController.addImage);


module.exports = router;