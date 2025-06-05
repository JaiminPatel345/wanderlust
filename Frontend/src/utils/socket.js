import { io } from 'socket.io-client';
import { getToken } from './tokenUtils';

let socket = null;

export const initializeSocket = async () => {
    try {
        if (socket?.connected) {
            return socket;
        }

        const token = getToken();
        if (!token) {
            console.debug('No token available for socket connection');
            return null;
        }

        const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        
        socket = io(socketUrl, {
            auth: {
                token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        socket.on('connect', () => {
            console.debug('Socket connected successfully');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            // Only disconnect if it's an authentication error
            if (error.message === 'Authentication error') {
                disconnectSocket();
            }
        });

        socket.on('disconnect', (reason) => {
            console.debug('Socket disconnected:', reason);
            if (reason === 'io server disconnect' || reason === 'transport close') {
                // Server disconnected us or transport closed, try to reconnect
                socket.connect();
            }
        });

        // Wait for connection to be established
        if (!socket.connected) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Socket connection timeout'));
                }, 10000); // Increased timeout to 10 seconds

                socket.once('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                socket.once('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        }

        return socket;
    } catch (error) {
        console.error('Error initializing socket:', error);
        disconnectSocket(); // Clean up on error
        return null;
    }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
};

export const reconnectSocket = async () => {
    disconnectSocket();
    return initializeSocket();
}; 