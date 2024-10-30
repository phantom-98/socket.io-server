const helperFunctions = require("./utils");

const joinRoom = (socket, users, socketToRoom) => {
  socket.on("join-room", ({roomID, userID, user}) => {
    try {
      // Store the user's socket id in the users object with the key as userID
      helperFunctions.appendUser(users, roomID, userID, user, socket.id);
      socketToRoom[socket.id] = roomID;
      console.log(users);
      // It lets the user join the room
      socket.join(roomID);
      // It lets everyone in the room know that a new user has joined except the user itself
      //socket.to(roomID).emit("user-connected", { userID: userID, user: user });
      const usersInThisRoom = helperFunctions.filterUsers(
        users,
        roomID,
        socket.id
      );
      socket.emit("all-users", usersInThisRoom);
    } catch (err) {
      console.log("Error in join-room: ", err);
    }
  });
};

const findUser = (socket, users) => {
  socket.on("find-user", (data) => {
    try {
      const user = helperFunctions.findUserByUserId(
        users,
        data.roomID,
        data.peerID
      );
      socket.emit("found-user", user.user);
    } catch (err) {
      console.log("Error in find-user: ", err);
    }
  });
};

const disconnect = (socket, users, socketToRoom) => {
  socket.on("disconnect", () => {
    try {
      const roomID = socketToRoom[socket.id];
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
        } else {
          users[roomID] = usersInThisRoom;
        }
        
        socket.to(roomID).emit("user-disconnected", user.userId);
      }
      console.log(users);
    } catch (err) {
      console.log("Error in disconnect: ", err);
    }
  });
};

const sendMessage = (socket, io) => {
  socket.on("send-message", (payload) => {
    console.log("message received at server", payload)
    try {
      io.emit("message", payload);
    } catch (err) {
      console.log("Error in send message: ", err);
    }
  });
};

const socketFunctions = {
  joinRoom,
  findUser,
  disconnect,
  sendMessage,
};

module.exports = socketFunctions;
