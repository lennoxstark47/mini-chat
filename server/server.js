const express = require('express');
const http = require("node:http");
const cors = require("cors");
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 4000;

const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

// Store connected users { socket.id: { userName: 'Name', socketId: 'id' } }
// This structure helps in sending the socketId to the client for targeting private messages
let onlineUsers = {};

// Helper to broadcast the updated online users list
function broadcastOnlineUsers() {
    // Convert onlineUsers object to an array of { userName, socketId } objects
    const usersList = Object.keys(onlineUsers).map(id => ({
        userName: onlineUsers[id].userName,
        socketId: id
    }));
    io.emit('onlineUsers', usersList);
}

io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // When a user enters their name
    socket.on('userName', (name) => {
        onlineUsers[socket.id] = { userName: name, socketId: socket.id };
        console.log(`User ${socket.id} set name to: ${name}`);
        broadcastOnlineUsers(); // Broadcast updated list to everyone
    });

    // Listen for 'message' (public chat) event from the client
    socket.on('message', (data) => {
        // Broadcast the message to all connected clients
        io.emit('messageResponse', data);
    });

    // NEW: Listen for 'privateMessage' event from the client
    // data will contain { recipientSocketId, sender, text, id, socketID }
    socket.on('privateMessage', (data) => {
        const recipientSocket = io.sockets.sockets.get(data.recipientSocketId);
        if (recipientSocket) {
            // Send to recipient
            recipientSocket.emit('privateMessageResponse', data);
            // Optional: Send a copy back to the sender so they see their own private message
            socket.emit('privateMessageResponse', data);
            console.log(`Private message from ${data.sender} to ${onlineUsers[data.recipientSocketId]?.userName || data.recipientSocketId}: ${data.text}`);
        } else {
            console.log(`Recipient ${data.recipientSocketId} not found for private message from ${data.sender}`);
            // Optional: Notify sender that recipient is offline
            socket.emit('privateMessageResponse', {
                sender: 'System',
                text: `${onlineUsers[data.recipientSocketId]?.userName || 'That user'} is currently offline.`,
                id: Date.now(),
                socketID: 'system'
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        delete onlineUsers[socket.id];
        broadcastOnlineUsers(); // Broadcast updated list
    });
});

server.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port} on all network interfaces`));