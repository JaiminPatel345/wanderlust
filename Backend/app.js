const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { Server } = require("socket.io");
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const listingsRoutes = require('./routes/listing.js');
const reviewsRoutes = require('./routes/review.js');
const usersRoutes = require('./routes/user.js');
const chatsRoutes = require('./routes/chat.js');
const { saveOriginalUrl } = require('./utilities/middleware.js');
const port = 3000;

// Database connection
main()
  .then(() => console.log(`Connection successful. You can view project on http://localhost:${port}`))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

// CORS setup for frontend-backend communication
app.use(cors({
  origin: process.env.REACT_APP_API_URL,  // Adjust as per your frontend deployment URL
  credentials: true,
}));

// API routes
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
