const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRouter');

const app = express();
//* Middleware
app.use(express.json());
if (process.env.NODE_ENV === 'devolopment') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
//   console.log('Hellow From MiddleWare🤟🏼');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//*Routes
app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/user', userRouter);

module.exports = app;
