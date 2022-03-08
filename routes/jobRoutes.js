const express = require('express');
const router = express.Router();

const JobController = require('../controllers/jobs');

const AuthHelper = require('../Helpers/AuthHelpers');

router.get('/jobs', AuthHelper.VerifyToken, JobController.getAllJobs);
router.get('/job/:id', AuthHelper.VerifyToken, JobController.getJob);

router.post('/job/add-job', AuthHelper.VerifyToken, JobController.addJob);
router.delete('/delete-job/:id', AuthHelper.VerifyToken, JobController.deleteJob);
router.delete('/update-job/:id', AuthHelper.VerifyToken, JobController.updateJob);
module.exports = router;