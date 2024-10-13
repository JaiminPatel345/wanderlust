const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require("socket.io");
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const session = require('express-session');
const RedisStore = require("connect-redis").default
const { createClient } = require("redis")

const listingsRoutes = require('./routes/listing.js');
const reviewsRoutes = require('./routes/review.js');
const usersRoutes = require('./routes/user.js');
const chatsRoutes = require('./routes/chat.js');
const port = process.env.PORT || 3000;

// Database connection
main()
  .then(() => console.log(`Connection successful. You can view project on http://localhost:${port}`))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

app.use(express.json());

// Initialize client.
const redisClient = createClient({
  password: process.env.REDIS_PASS,
  socket: {
    host: 'redis-11634.c330.asia-south1-1.gce.redns.redis-cloud.com',
    port: 11634
  }
});

redisClient.connect()
  .then(() => {
    console.log("Connected to Redis");
    return redisClient.ping(); // Pinging Redis to check if it's reachable
  })
  .then((result) => {
    console.log("Redis ping result:", result); // Logs the ping result
  })
  .catch((error) => {
    console.error("Redis connection error:", error); // More descriptive error handling
  });


// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
})

// Initialize session storage.
app.use(
  session({
    store: redisStore,
    resave: false, // force lightweight session keep alive (touch)
    saveUninitialized: false, // only save session when data exists
    secret: process.env.SECRET,
    cookie: {
      // Optional: Customize cookie settings as needed
      // secure: true, // use true if using HTTPS
      maxAge: 1000 * 3600 * 24 * 3, // 3 days
    },
  }),
);

// CORS setup for frontend-backend communication
app.use(cors({
  origin: process.env.REACT_APP_API_URL,  // Adjust as per your frontend deployment URL
  credentials: true,
}));

// API routes
app.use((req, res, next) => {
  if (req.path === '/') {
    req.url = '/listings';
  }
  next();
});
app.use('/listings/:id/reviews', reviewsRoutes);
app.use('/listings', listingsRoutes);
app.use('/chats', chatsRoutes);
app.use('/', usersRoutes);

// Socket.io for chat
io.on('connection', (socket) => {
  socket.on('chat message', (data) => {
    socket.broadcast.emit("chat message", `${data.username}  : ${data.msg}`);
  });
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({ error: err.message });
});

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));
