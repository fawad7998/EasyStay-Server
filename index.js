require('dotenv').config();

const app = require('./app');
const socket = require('./socket');
const config = require('config');
const mongoose = require('mongoose');

// const cronJobsUtil = require('./util/cronJobs');

const io = socket.prepare(app);
const socketFlag = config.get('socket');
app.set(socketFlag, io);
module.exports.socket = app.get(socketFlag);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/easystay');

const conn = mongoose.connection;

conn.on('error', () => console.log('connection error'));

conn.once('open', () => console.log('Connected to MongoDB'));
