const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const developerRouter = require('./routes/developerRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/developers', developerRouter);
app.use('/api/v1/users', userRouter);

//Error handling for all http methods when route can't be found
//Put it under app.use because it means the developerRouter & userRouter did not catch the request
// * stands for everything
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//Express global middleware handler
app.use(globalErrorHandler);

module.exports = app;
