const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({

    user: { type: String, default: '5cd449c7bd34a44b54f2c8af' },
    username: { type: String, default: 'soaga' },
    company: { type: String, default: '' },
    jobtitle: { type: String, default: '' },
    location: { type: String, default: '' },
    jobfunction: { type: String, default: '' },
    employmenttype: { type: String, default: '' },
    industry: { type: String, default: '' },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    created: { type: Date, default: Date.now() },



});

module.exports = mongoose.model('Job', jobSchema);