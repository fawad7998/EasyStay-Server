const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/easystay');

const conn = mongoose.connection;

conn.on('error', () => console.log('connection error'));

conn.once('open', () => console.log('Connected to MongoDB'));

module.exports = conn;
