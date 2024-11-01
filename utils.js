const getHostUser = (users, roomId) => {
  if (users[roomId]) {
    const user = users[roomId].find((user) => user.peerId === roomId);
    return user;
  }
  return undefined;
};

const appendUser = (users, roomId, peerId, user, socketId, token) => {
  if (users[roomId]) {
    const host = getHostUser(users, roomId);
    if (host && host.socketId === token) {
      if (users[roomId].find((user) => user.socketId === socketId)) {
        return;
      }
      users[roomId].push({ socketId, peerId, ...user });
    }
  } else {
    if (roomId === peerId) {
      users[roomId] = [{ socketId, peerId, ...user }];
    }
  }
};

const filterUsers = (users, roomId, socketId) => {
  if (users[roomId]) {
    return users[roomId].filter((user) => user.socketId !== socketId);
  }
  return [];
};

const findUserByPeerId = (users, roomId, peerId) => {
  if (users[roomId]) {
    const user = users[roomId].find((user) => user.peerId === peerId);
    return user;
  }
  return undefined;
};

const findUserBySocketId = (users, roomId, socketId) => {
  if (users[roomId]) {
    const user = users[roomId].find((user) => user.socketId === socketId);
    return user;
  }
  return undefined;
};

const helperFunctions = {
  getHostUser,
  appendUser,
  filterUsers,
  findUserByPeerId,
  findUserBySocketId,
};

module.exports = helperFunctions;
