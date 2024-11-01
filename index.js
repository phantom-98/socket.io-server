const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.ORIGIN || "*",
  },
});
const socketFunctions = require("./sockets");

const users = {};
// const users = new Map();
const socketToRoom = {};
const tokens = {};

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  // socket is the user who is connecting to the server
  socketFunctions.requestJoinRoom(socket, io, users, tokens);
  socketFunctions.allowJoinRoom(socket, io, users, tokens);
  socketFunctions.joinRoom(socket, io, users, socketToRoom);
  socketFunctions.disconnect(socket, io, users, socketToRoom, tokens);
  socketFunctions.sendMessage(socket, io, socketToRoom);
});

app.get("/", (req, res) => {
  res.send("Server is running.");
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
