const express = require('express');
require('express-async-errors');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./utils/config');
const usersRouter = require('./controllers/users');
const blogsRouter = require('./controllers/blogs');
const middleWare = require('./utils/middleware');

mongoose.set('useCreateIndex', true);

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);

app.use(middleWare.errorHandler);

module.exports = app;
