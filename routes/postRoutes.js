const express = require('express');
const router = express.Router();

const PostController = require('../controllers/posts');

const AuthHelper = require('../Helpers/AuthHelpers');

router.get('/posts', AuthHelper.VerifyToken, PostController.getAllPosts);
router.get('/post/:id', AuthHelper.VerifyToken, PostController.getPost);

router.post('/post/add-post', AuthHelper.VerifyToken, PostController.addPost);
router.post('/post/add-like', AuthHelper.VerifyToken, PostController.addLike);
router.post('/post/add-comment', AuthHelper.VerifyToken, PostController.addComment);
router.delete('/delete-post/:id', AuthHelper.VerifyToken, PostController.deletePost);
router.put('/post/update-post/:postId', AuthHelper.VerifyToken, PostController.updatePost);
module.exports = router;