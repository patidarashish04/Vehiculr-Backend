const express = require('express');
require('express-async-errors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./app/middleware/errorHandler');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const AppError = require('./app/utils/appError');
const globalErrorHandler = require('./app/controllers/errorController');
const houseRouter = require('./app/routes/houseRoutes');
const userRouter = require('./app/routes/userRoutes');
const reviewRouter = require('./app/routes/reviewRoutes');
const bookingRouter = require('./app/routes/bookingRoutes');
const blogRouter = require('./app/routes/blogRoutes');
const postReviewRouter = require('./app/routes/postReviewRoutes');
const brandRouter = require('./app/routes/brandRoutes');
const garageRouter = require('./app/routes/garageRoutes');
const cityRouter = require('./app/routes/locationRoutes');
const feedRouter = require('./app/routes/feedRoutes');





const cors = require('cors');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //to log req/res info
}

//Set security HTTP headers
app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({
    policy: 'cross-origin'
  })
);

//Implement CORS
app.use(cors());
app.options('*', cors());

app.use(express.json());
//Body parser
app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());
app.use(compression());
app.set('trust proxy', 1);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);

// 2) ROUTES
app.use('/api/users', userRouter);
app.use('/api/houses', houseRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/brands', brandRouter);
app.use('/api/postReview', postReviewRouter);
app.use('/api/garages', garageRouter);
app.use('/api/city', cityRouter);
app.use('/api/feed', feedRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
