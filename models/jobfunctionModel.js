const mongoose = require('mongoose');
const JobFunctionSchema = mongoose.Schema({

    name: { type: String, default: '' },

});

module.exports = mongoose.model('JobFunction', JobFunctionSchema);