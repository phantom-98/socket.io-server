const helperFunctions = require("./utils");

const requestJoinRoom = (socket, io, users, tokens) => {
  socket.on("request-join", ({ roomId, peerId, user }) => {
    try {
      console.log("request-join", roomId, user, socket.id);
      const host = helperFunctions.getHostUser(users, roomId);
      if (host) {
        if (tokens[roomId]) {
          socket.emit("user-allow-join", {roomId, token: tokens[roomId]});
        } else {
          io.to(roomId).emit("user-request-join", {roomId, socketId: socket.id, peerId, user});
        }
      } else {
        socket.emit("host-not-found", roomId);
      }
    } catch (err) {
      console.log("Error in request-join: ", err);
    }
  });
};

const allowJoinRoom = (socket, io, users, tokens, socketToRoom) => {
  socket.on("allow-join", ({ roomId, socketId, user }) => {
    try {
      console.log("allow-join", roomId, socketId, user);
      const host = helperFunctions.getHostUser(users, roomId);
      if (host && host.socketId === socket.id) {
        socket.to(socketId).emit("user-allow-join", {roomId, token: socket.id});
        console.log("allowed user", socketId, user.name)
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
        console.log("rejected user", socketId, user.name)
      }
    } catch (err) {
      console.log("Error in reject-join: ", err);
    }
  })
  socket.on("allow-all", ({roomId, newUsers}) => {
    try {
      console.log("allow-all", roomId, socket.id);
      const host = helperFunctions.getHostUser(users, roomId);
      if (host && host.socketId === socket.id) {
        tokens[roomId] = socket.id;
        helperFunctions.appendMultiUsers(users, roomId, newUsers);
        io.to(roomId).emit("multi-users-joined", newUsers);
        console.log('multi-users-join', newUsers)

        socket.to(newUsers.map(u => {
          socketToRoom[u.socketId] = roomId;
          io.sockets.sockets.get(u.socketId).join(roomId);

          return u.socketId;
        })).emit("all-users", users[roomId]);
        console.log("allowed all user", roomId)
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
      
      socket.emit("all-users", users[roomId]);
      socket.to(roomId).emit("user-joined", {roomId, peerId, ...user});
      console.log("emit all-users event to user", roomId, users[roomId])
    } catch (err) {
      console.log("Error in join-room: ", err);
    }
  });
};

const readyRoom = (socket) => {
  socket.on("am-ready", ({roomId, peerId, user}) => {
    try {
      console.log("user is ready", roomId, peerId, user);
      socket.to(roomId).emit("user-ready", {roomId, peerId, ...user});
    } catch (err) {
      console.log("Error in ready-room: ", err);
    }
  });
};

const disconnect = (socket, io, users, socketToRoom, tokens) => {
  socket.on("disconnect", () => {
    try {
      const roomID = socketToRoom[socket.id];
      delete socketToRoom[socket.id];
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
          console.log("user left", roomID, user);
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
      console.log("message sent to room", socketToRoom[socket.id], payload);
    } catch (err) {
      console.log("Error in send message: ", err);
    }
  });
};

const sendSignals = (socket, io, socketToRoom) => {
  socket.on("send-signal", (payload) => {
    try {
      io.to(socketToRoom[socket.id]).emit("signals", payload);
      console.log("signal sent to room", socketToRoom[socket.id], payload);
    } catch (err) {
      console.log("Error in send signal: ", err);
    }
  });
};

const socketFunctions = {
  allowJoinRoom,
  requestJoinRoom,
  joinRoom,
  readyRoom,
  disconnect,
  sendMessage,
  sendSignals,
};

module.exports = socketFunctions;
