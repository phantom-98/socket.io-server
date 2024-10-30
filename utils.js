const appendUser = (users, roomID, userID, user, socketId) => {
  if (users[roomID]) {
    if (users[roomID].find((user) => user.socketId === socketId)) {
      return;
    }
    users[roomID].push({ socketId, userId: userID, user });
  } else {
    users[roomID] = [{ socketId, userId: userID, user }];
  }
};

const filterUsers = (users, roomID, socketId) => {
  if (users[roomID]) {
    return users[roomID].filter((user) => user.socketId !== socketId);
  }
  return [];
};

const findUserByUserId = (users, roomID, userID) => {
  if (users[roomID]) {
    const usersInThisRoom = users[roomID];
    const user = usersInThisRoom.find((user) => user.userId === userID);
    return user;
  }
  return undefined;
};

const findUserBySocketId = (users, roomID, socketID) => {
  if (users[roomID]) {
    const usersInThisRoom = users[roomID];
    const user = usersInThisRoom.find((user) => user.socketId === socketID);
    return user;
  }
  return undefined;
};

const helperFunctions = {
  appendUser,
  filterUsers,
  findUserByUserId,
  findUserBySocketId,
};

module.exports = helperFunctions;
