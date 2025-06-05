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

        socket = io(import.meta.env.VITE_API_URL, {
            auth: {
                token
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.debug('Socket connected successfully');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            disconnectSocket();
        });

        socket.on('disconnect', (reason) => {
            console.debug('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                socket.connect();
            }
        });

        // Wait for connection to be established
        if (!socket.connected) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Socket connection timeout'));
                }, 5000);

                socket.once('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        }

        return socket;
    } catch (error) {
        console.error('Error initializing socket:', error);
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