const express = require('express');
const path = require('path');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorhandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  // console.log(req.headers);
  next();
});
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
