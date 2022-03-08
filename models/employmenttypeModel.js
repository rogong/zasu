const mongoose = require('mongoose');
const EmploymentTypeSchema = mongoose.Schema({

    name: { type: String, default: '' },

});

module.exports = mongoose.model('EmploymentType', EmploymentTypeSchema);