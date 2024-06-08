const socketIo = require('socket.io');
const Message = require('../models/Message');

// Note: You should define `server` before using it
let io;
const onlineUsers = new Map();
console.log(onlineUsers,'online users');

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected');
        
        // Handle user joining
        socket.on('join', (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} is online with socket ID ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            for (let [userId, socketId] of onlineUsers) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} went offline`);
                    break;
                }
            }
        });

        // Handle message status updates (delivered/seen)
        socket.on('messageDelivered', async (messageId) => {
            try {
                // Update message status in the database (delivered)
                await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
            } catch (error) {
                console.error('Error handling message delivered status update:', error);
            }
        });

        socket.on('messageSeen', async (messageId) => {
            try {
                // Update message status in the database (seen)
                await Message.findByIdAndUpdate(messageId, { status: 'seen' });
            } catch (error) {
                console.error('Error handling message seen status update:', error);
            }
        });
    });
};

const sendNotification = (receiver, message) => {
    if (io) {
        const receiverSocketId = onlineUsers.get(receiver);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('notification', message);
        }
    }
};

const getUserSocket = (userId) => {
    const socketId = onlineUsers.get(userId);
    return socketId ? io.sockets.sockets.get(socketId) : null;
};

module.exports = { initializeSocket, sendNotification, getUserSocket };
