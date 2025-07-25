// server.js
const express = require('express');
const http = require("node:http"); // Changed from https to http for local simplicity
const cors = require("cors");
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 4000;

const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
    }
});

// Store connected users: { socket.id: { userName: 'name', socketId: 'id' } }
// This structure allows us to easily find user details
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // When a user enters their name
    socket.on('userName', (name) => {
        // Store the user's name and their current socket ID
        onlineUsers[socket.id] = { userName: name, socketId: socket.id };
        console.log(`User ${socket.id} set name to: ${name}`);

        // Send the updated list of online user objects to all clients
        io.emit('onlineUsers', Object.values(onlineUsers));
    });

    // Listen for 'message' event from the client
    socket.on('message', (data) => {
        // For now, broadcast all messages to all connected clients.
        // To implement private chat, you would check data.recipient here
        // and send to a specific socket using io.to(targetSocketId).emit(...)
        // and also to the sender socket.emit(...)
        io.emit('messageResponse', data);
    });

    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        // Remove the disconnected user from the list
        delete onlineUsers[socket.id];
        // Send the updated list of online user objects to all clients
        io.emit('onlineUsers', Object.values(onlineUsers));
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));