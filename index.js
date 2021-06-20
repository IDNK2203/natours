const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const globalErrorhandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// GLOBAL MIDDLEWARE STACK

// 1 SET SECURITY HEADERS
app.use(helmet());

// 2 LOG REQUEST DEATILS
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3 LIMIT THE RATE OF REQUEST
const rateLimitObject = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request try again in an hour'
});
app.use('/api', rateLimitObject);

// 4 PASRE REQUEST DATA
app.use(express.json({ limit: '10kb' }));

// PREVENT NO SQL INJECTION ATTACKS
app.use(mongoSanitize());

// PREVENT XSS ATTACKS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'duration',
      'maxGroupSize'
    ]
  })
);

// 5 SERVE STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// 6 TEST MIDDLEWARE
// app.use((req, res , next)=>{
//   console.log(req.headers);
//   next()
// })

// @ Tours Routes
app.use('/api/v1/tours/', tourRouter);

// @ Users Routes
app.use('/api/v1/users/', userRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `This url ${req.originalUrl} was not found on this server.`,
      404
    )
  );
});

app.use(globalErrorhandler);

module.exports = app;
