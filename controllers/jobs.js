
const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const Job = require('../models/jobModels');
const User = require('../models/userModels');
const moment = require('moment');
const request = require('request');

cloudinary.config({
    cloud_name: 'rogong',
    api_key: '622262996577752',
    api_secret: 'StmC7nLI03KTJt-L7LflweUq43U'
});

module.exports = {
    addJob(req, res) {
        const schema = Joi.object().keys({
            description: Joi.string().required(),
            // image: Joi.optional()
        });
        const reqbody = {
            description: req.body.description
        }
        const { error } = Joi.validate(reqbody, schema);
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST)
                .json({ msg: error.details });

        }
        const body = {


            company: req.body.company,
            jobtitle: req.body.jobtitle,
            location: req.body.location,
            jobfunction: req.body.jobfunction,
            employmenttype: req.body.employmenttype,
            industry: req.body.industry,
            website: req.body.website,
            created: new Date()
        };

        Job.create(body)
            .then(async job => {
                await User.update({
                    _id: req.user._id
                },
                    {
                        $push: {
                            jobs: {
                                jobId: job._id,
                                created: new Date()
                            }
                        }

                    });
                res.status(HttpStatus.OK)
                    .json({ message: 'Job created', job });
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error occured' })
            })

    },

    async  getAllJobs(req, res) {
        try {
            const today = moment().startOf('day');
            const tomorrow = moment(today).add(7, 'days');

            const jobs = await Job.find({
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

            const top = await Job.find({
                totalLikes: { $gte: 10 },
                created: { $gte: today.toDate(), $lt: tomorrow.toDate() }
            })
                .populate('user')
                .sort({ created: -1 })

            return res.status(HttpStatus.OK)
                .json({ message: 'All jobs', jobs, top });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error occured' })
        }

    },


    async getJob(req, res) {
        try {
            const job = await Job.findOne({ _id: req.params.id })
                .populate('user')
                .populate('comments.userId')

            return res.status(HttpStatus.OK)
                .json({ message: 'Job found', job });

        } catch (error) {

            return res.status(HttpStatus.NOT_FOUND)
                .json({ message: 'Job not found', job })

        }
    },

    updateJob(req, res) {
        const schema = Joi.object().keys({
            job: Joi.string().required(),
            // image: Joi.optional()
        });
        const reqbody = {
            job: req.body.job
        }
        const { error } = Joi.validate(reqbody, schema);
        if (error && error.details) {
            return res.status(HttpStatus.BAD_REQUEST)
                .json({ msg: error.details });

        }
        const body = {
            user: req.user._id,
            username: req.user.username,
            job: req.body.job,
            created: new Date()
        };
        if (req.body.job && !req.body.image) {
            Job.updateOne({ _id: req.params.id, user: req.user._id }, body)
                .then(async job => {
                    await User.update({
                        _id: req.user._id
                    },
                        {
                            $push: {
                                jobs: {
                                    jobId: job._id,
                                    job: job.job,
                                    created: new Date()
                                }
                            }

                        });
                    res.status(HttpStatus.OK)
                        .json({ message: 'Job updated', job });
                })
                .catch(err => {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({ message: 'Error occured' })
                })
        }

        if (req.body.job && req.body.image) {
            cloudinary.uploader.upload(req.body.image, async (result) => {
                const reqBody = {
                    user: req.user._id,
                    username: req.user.username,
                    job: req.body.job,
                    imgId: result.public_id,
                    imgVersion: result.version,
                    created: new Date()
                };
                Job.updateOne({ _id: req.params.id, user: req.user._id }, reqBody)
                    .then(async job => {
                        await User.update({
                            _id: req.user._id
                        },
                            {
                                $push: {

                                    jobs: {
                                        jobId: job._id,
                                        job: job.job,
                                        created: new Date()
                                    }
                                }

                            });
                        res.status(HttpStatus.OK)
                            .json({ message: 'Job updated', job });
                    })
                    .catch(err => {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .json({ message: 'Error occured' })
                    });
            }

            )
        }
    },



    deleteJob(req, res) {
        Job.deleteOne({ _id: req.params.id, user: req.user._id })
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
};

