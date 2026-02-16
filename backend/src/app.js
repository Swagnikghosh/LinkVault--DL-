const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const hpp = require('hpp');

// dev imports
const errorHandler = require('./middlewares/errorHandler');
const limiter = require('./middlewares/rateLimiter');
const itemRouter = require('./routers/itemRouter');
const authRouter = require('./routers/authRouter');
const AppError = require('./utils/appError');

const app = express();

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const normalizeOrigin = (value) => String(value).replace(/\/$/, '');

const allowedOrigins = [
  process.env.FRONT_END_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
  .filter(Boolean)
  .map(normalizeOrigin);

const corsOptions = {
  origin(origin, callback) {
    // Allow tools like Postman/curl (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(normalizeOrigin(origin))) return callback(null, true);
    return callback(new AppError('CORS origin not allowed', 403));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

// middleware use
app.use(helmet());
app.use(hpp());
app.use(cookieParser()); // to read from cookies
app.use('/api', limiter); // rate limiter
app.use(express.json({ limit: '50mb' })); // body parser (allow large text payloads)
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // URL-encoded parser (for forms)

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/item', itemRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
