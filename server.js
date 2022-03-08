const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

const _ = require('lodash');

const app = express();


// Load env vars
dotenv.config({ path: './config/config.env' });
// Connect Database
connectDB();

// Integrate IO Server
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const { User } = require('./Helpers/UserClass');

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));
app.use(logger('dev'));

mongoose.Promise = global.Promise;



require('./socket/streams')(io, User, _);
require('./socket/private')(io);

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const messageRoutes = require('./routes/messageRoutes');
const imageRoutes = require('./routes/imageRoutes');

app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', jobRoutes);
app.use('/api', userRoutes);
app.use('/api', friendRoutes);
app.use('/api', messageRoutes);
app.use('/api', imageRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT,  console.log(
    `Server runs in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  
)