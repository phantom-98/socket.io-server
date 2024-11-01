const helperFunctions = require("./utils");

const requestJoinRoom = (socket, io, users, tokens) => {
  socket.on("request-join", ({ roomId, user }) => {
    try {
      console.log("request-join", roomId, user, socket.id);
      const host = helperFunctions.getHostUser(users, roomId);
      if (host) {
        if (tokens[roomId]) {
          socket.emit("user-allow-join", {roomId, token: tokens[roomId]});
        } else {
          io.to(roomId).emit("user-request-join", {roomId, socketId: socket.id, user});
        }
      } else {
        socket.emit("host-not-found", roomId);
      }
    } catch (err) {
      console.log("Error in request-join: ", err);
    }
  });
};

const allowJoinRoom = (socket, io, users, tokens) => {
  socket.on("allow-join", ({ roomId, socketId, user }) => {
    try {
      console.log("allow-join", roomId, socketId, user);
      const host = helperFunctions.getHostUser(users, roomId);
      if (host && host.socketId === socket.id) {
        socket.to(socketId).emit("user-allow-join", {roomId, token: socket.id});
      }
    } catch (err) {
      console.log("Error in allow-join: ", err);
    }
  });
  socket.on('reject-join', ({roomId, socketId, user}) => {
    try {
      console.log("reject-join", roomId, socketId);
      const host = helperFunctions.getHostUser(users, roomId);
      if (host && host.socketId === socket.id) {
        socket.to(socketId).emit("user-reject-join", roomId);
      }
    } catch (err) {
      console.log("Error in reject-join: ", err);
    }
  })
  socket.on("allow-all", ({roomId}) => {
    try {
      console.log("allow-all", roomId, socket.id);
      const host = helperFunctions.getHostUser(users, roomId);
      if (host && host.socketId === socket.id) {
        tokens[roomId] = socket.id;
        socket.to(roomId).emit("user-allow-join", {roomId, token: socket.id});
      }
    } catch (err) {
      console.log("Error in allow-all: ", err);
    }
  })
};

const joinRoom = (socket, io, users, socketToRoom) => {
  socket.on("join-room", ({roomId, peerId, token, user}) => {
    try {
      console.log("new user joined the room", roomId, peerId, user, token);

      // Store the user's socket id in the users object with the key as userID
      helperFunctions.appendUser(users, roomId, peerId, user, socket.id, token);
      socketToRoom[socket.id] = roomId;
      // It lets the user join the room
      socket.join(roomId);
      
      io.to(roomId).emit("all-users", users[roomId]);
      console.log("emit all-users event to user", roomId, users[roomId])
    } catch (err) {
      console.log("Error in join-room: ", err);
    }
  });
};

const disconnect = (socket, io, users, socketToRoom, tokens) => {
  socket.on("disconnect", () => {
    try {
      const roomID = socketToRoom[socket.id];
      socket.leave(roomID);
      if (roomID) {
        const user = helperFunctions.findUserBySocketId(
          users,
          roomID,
          socket.id
        );
        const usersInThisRoom = helperFunctions.filterUsers(
          users,
          roomID,
          socket.id
        );
        if (usersInThisRoom.length === 0) {
          delete users[roomID];
          delete tokens[roomID];
        } else {
          users[roomID] = usersInThisRoom;
          io.to(roomID).emit("user-left", user);
        }
      }
    } catch (err) {
      console.log("Error in disconnect: ", err);
    }
  });
};

const sendMessage = (socket, io, socketToRoom) => {
  socket.on("send-message", (payload) => {
    try {
      io.to(socketToRoom[socket.id]).emit("message", payload);
    } catch (err) {
      console.log("Error in send message: ", err);
    }
  });
};

const socketFunctions = {
  allowJoinRoom,
  requestJoinRoom,
  joinRoom,
  disconnect,
  sendMessage,
};

module.exports = socketFunctions;
