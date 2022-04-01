const express = require('express');
const morgan = require('morgan');
const AppError = require('./Utils/appError');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRouter');
const globalErrorHandler = require('./Controller/errorController');

const app = express();
//* Middleware
app.use(express.json());
if (process.env.NODE_ENV === 'devolopment') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

app.use((req, _res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//*Routes
app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/user', userRouter);
//*It Routes is not a valid
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Fail',
  //   mesaage: `Can't find ${req.originalUrl} on this server`,
  // });
  const err = new AppError(`Can't Find ${req.originalUrl} on this server`, 404);

  next(err);
});
//*Creat A Error middleware to handle all the errors
app.use(globalErrorHandler);
module.exports = app;
