const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                throw new Error('Authentication error');
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);
        
        // Join user's personal room for notifications
        socket.join(`user-${socket.userId}`);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const emitToUser = (userId, event, data) => {
    const socket = getIO();
    socket.to(`user-${userId}`).emit(event, data);
};

const emitAnalyticsUpdate = (listingId, data) => {
    const socket = getIO();
    socket.emit(`analytics-${listingId}`, data);
};

module.exports = {
    initializeSocket,
    getIO,
    emitToUser,
    emitAnalyticsUpdate
}; 