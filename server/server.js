const express = require('express');
const http = require('http');
const cors = require("cors");
const {Server} = require('socket.io')

const app = express();

const port = process.env.PORT || 4000;

const server = http.createServer(app);
app.use(cors())
const io = new Server(server,{
    cors: {
        origin: "*",
    }
})
io.on('connection',(socket)=>{
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('disconnect',()=>{
        console.log('🔥: A user disconnected');
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`));