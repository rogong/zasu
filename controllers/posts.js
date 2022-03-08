
const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const Post = require('../models/postModels');
const User = require('../models/userModels');
const moment = require('moment');
const request = require('request');

cloudinary.config({
    cloud_name: 'rogong',
    api_key: '622262996577752',
    api_secret: 'StmC7nLI03KTJt-L7LflweUq43U'
});

module.exports = {
    addPost(req, res) {
        const schema = Joi.object().keys({
            post: Joi.string().required(),
            // image: Joi.optional()
        });
        const reqbody = {
            post: req.body.post
        }
        const { error } = Joi.validate(reqbody, schema);
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST)
                .json({ msg: error.details });

        }
        const body = {
            user: req.user._id,
            username: req.user.username,
            post: req.body.post,
            created: new Date()
        };
        if (req.body.post && !req.body.image) {
            Post.create(body)
                .then(async post => {
                    await User.update({
                        _id: req.user._id
                    },
                        {
                            $push: {
                                posts: {
                                    postId: post._id,
                                    post: post.post,
                                    created: new Date()
                                }
                            }

                        });
                    res.status(HttpStatus.OK)
                        .json({ message: 'Post created', post });
                })
                .catch(err => {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({ message: 'Error occured' })
                })
        }

        if (req.body.post && req.body.image) {
            cloudinary.uploader.upload(req.body.image, async (result) => {
                const reqBody = {
                    user: req.user._id,
                    username: req.user.username,
                    post: req.body.post,
                    imgId: result.public_id,
                    imgVersion: result.version,
                    created: new Date()
                };
                Post.create(reqBody)
                    .then(async post => {
                        await User.update({
                            _id: req.user._id
                        },
                            {
                                $push: {

                                    posts: {
                                        postId: post._id,
                                        post: post.post,
                                        created: new Date()
                                    }
                                }

                            });
                        res.status(HttpStatus.OK)
                            .json({ message: 'Post created', post });
                    })
                    .catch(err => {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .json({ message: 'Error occured' })
                    });
            }

            )
        }
    },

    async  getAllPosts(req, res) {
        try {
            const today = moment().startOf('day');
            const tomorrow = moment(today).add(7, 'days');

            const posts = await Post.find({
                // created: { $gte: today.toDate(), $lt: tomorrow.toDate() } 
            })
                .populate('user')
                .sort({ created: -1 })

            const user = await User.findOne({ _id: req.user._id });
            if (user.city == '' && user.city == '' && user.country == '') {
                request('https://geoip-db.com/json', { json: true }, async (err, res, body) => {
                    await User.update({
                        _id: req.user._id
                    }, {
                            country: body.country_name,
                            state: body.state,
                            city: body.city
                        });
                })
            }

            const top = await Post.find({
                totalLikes: { $gte: 10 },
                created: { $gte: today.toDate(), $lt: tomorrow.toDate() }
            })
                .populate('user')
                .sort({ created: -1 })

            return res.status(HttpStatus.OK)
                .json({ message: 'All posts', posts, top });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error occured' })
        }

    },

    async addLike(req, res) {
        const postId = req.body._id;
        await Post.update({
            _id: postId,
            'likes.username': { $ne: req.user.username }
        },
            {
                $push: {
                    likes: { username: req.user.username }
                },
                $inc: { totalLikes: 1 }
            }
        )
            .then(() => {
                res.status(HttpStatus.OK)
                    .json({ message: 'You like the post' });

            })
            .catch(err =>
                res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error occured' })
            );
    },

    async addComment(req, res) {
        const postId = req.body.postId;

        await Post.update({
            _id: postId
        },
            {
                $push: {
                    comments: {
                        userId: req.user._id,
                        username: req.user.username,
                        comment: req.body.comment,
                        createdAt: new Date()
                    }
                },

            }
        )
            .then(() => {
                res.status(HttpStatus.OK)
                    .json({ message: 'Comment added to the post' });

            })
            .catch(err =>
                res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error occured' })
            );

    },

    async getPost(req, res) {
        try {
            const post = await Post.findOne({ _id: req.params.id })
                .populate('user')
                .populate('comments.userId')

            return res.status(HttpStatus.OK)
                .json({ message: 'Post found', post });

        } catch (error) {

            return res.status(HttpStatus.NOT_FOUND)
                .json({ message: 'Post not found', post })

        }
    },

    updatePost(req, res) {
        const schema = Joi.object().keys({
            post: Joi.string().required(),
            // image: Joi.optional()
        });
        const reqbody = {
            post: req.body.post
        }
        const { error } = Joi.validate(reqbody, schema);
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST)
                .json({ msg: error.details });

        }

        const body = {

            user: req.user._id,
            username: req.user.username,
            post: req.body.post,
            updated: new Date()
        };
        if (req.body.post && !req.body.image) {
            Post.updateOne({ _id: req.params.postId, user: req.user._id }, body)
                .then(async post => {
                    await User.update({
                        _id: req.user._id
                    },
                        {
                            $push: {
                                posts: {
                                    postId: post._id,
                                    post: post.post,
                                    created: new Date()
                                }
                            }

                        });
                    res.status(HttpStatus.OK)
                        .json({ message: 'Post updated', post });
                })
                .catch(err => {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({ message: 'Error occured' })
                })
        }

        if (req.body.post && req.body.image) {
            cloudinary.uploader.upload(req.body.image, async (result) => {
                const reqBody = {
                    user: req.user._id,
                    username: req.user.username,
                    post: req.body.post,
                    imgId: result.public_id,
                    imgVersion: result.version,
                    updated: new Date()
                };
                Post.updateOne({ _id: req.params.postId, user: req.user._id }, reqBody)
                    .then(async post => {
                        await User.update({
                            _id: req.user._id
                        },
                            {
                                $push: {

                                    posts: {
                                        postId: post._id,
                                        post: post.post,
                                        created: new Date()
                                    }
                                }

                            });
                        res.status(HttpStatus.OK)
                            .json({ message: 'Post updated', post });
                    })
                    .catch(err => {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .json({ message: 'Error occured' })
                    });
            }

            )
        }
    },



    deletePost(req, res) {
        Post.deleteOne({ _id: req.params.id, user: req.user._id })
            .then(result => {
                if (result.n > 0) {
                    res.status(200).json({ message: "Deletion successful!" });
                } else {
                    res.status(401).json({ message: "Not authorized!" });
                }
            })
            .catch(error => {
                res.status(500).json({ message: "Deletion failed!" });
            });
    }

}