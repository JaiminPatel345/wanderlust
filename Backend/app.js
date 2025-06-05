const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {formatResponse} = require('./utilities/errorHandler');
const { initializeSocket } = require('./utilities/socket');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const session = require('express-session');
const {store: redisStore} = require('./utilities/redis');

const listingsRoutes = require('./routes/listing.js');
const reviewsRoutes = require('./routes/review.js');
const usersRoutes = require('./routes/user.js');
const otpRoutes = require('./routes/otp.js');
const analyticsRoutes = require('./routes/analytics.js');
const notificationsRoutes = require('./routes/notifications.js');
const port = process.env.PORT || 3000;

// Initialize Socket.IO
initializeSocket(server);

// Database connection
main().
    then(() => console.log(`Database Connection successful.`)).
    catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

app.use(express.json());
app.set('trust proxy', 1);
app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
      crossOriginOpenerPolicy: {
        policy: 'unsafe-none',
      },
    }),
);

// Improved CORS configuration
const allowedOrigins = [
  process.env.REACT_APP_API_URL || 'http://localhost:5173',
];

// Add second origin only if it exists
if (process.env.REACT_APP_API_URL2) {
  allowedOrigins.push(process.env.REACT_APP_API_URL2);
}

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));

app.use(
    session({
      store: redisStore,
      resave: false,
      saveUninitialized: false,
      secret: process.env.SECRET,
      name: 'sessionId', // Custom name instead of 'connect.sid'
      proxy: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 3600 * 2, //2 H
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        httpOnly: true, // Added security
      },
    }),
);

// API routes
// Proper redirect for root path
app.get('/', (req, res) => {
  res.redirect('/listings');
});

app.use('/listings/:id/reviews', reviewsRoutes);
app.use('/listings', listingsRoutes);
app.use('/otp', otpRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/', usersRoutes);

// 404 handler for routes that don't exist
app.use((req, res) => {
  res.status(404).json(formatResponse(false, 'Route not found'));
});

app.use((err, req, res) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json(formatResponse(false, message));
});

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));