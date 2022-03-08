const mongoose = require('mongoose');

var options = {
  "mongos": {
    "ssl": true,
    "sslValidate": false
  }
};


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;