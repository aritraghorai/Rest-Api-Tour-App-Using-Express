const express = require('express');
const morgan = require('morgan');
const AppError = require('./Utils/appError');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRouter');
const globalErrorHandler = require('./Controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('mongo-sanitizer');
const xss = require('xss-clean');
const app = express();
const hpp = require('hpp');
//* Middleware

//*Body Parser
app.use(express.json({ limit: '10kb' }));
//*Data Sanization againest nosql injection
app.use(mongoSanitizer());
//*Data Sanitizer againest xss injection
app.use(xss());
if (process.env.NODE_ENV === 'devolopment') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  mesaage: 'Too Manu request from this ip,please wait try an hout later',
});
//*Rate Limiter
app.use('/api', limiter);
//*Security Http Header
app.use(helmet());
//*Prevent http parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'difficulty',
      'price',
      'maxGroupSize',
    ],
  })
);
//*Serving Static Files
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
