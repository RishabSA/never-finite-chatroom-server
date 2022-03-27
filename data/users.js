const usersInRooms = [];

const addUser = ({ id, name, room, photoURL, email }) => {
  name = name;
  room = room;
  photoURL = photoURL;
  email = email;

  // const existingUser = usersInRooms.find(
  //   (user) => user.room === room && user.email === email
  // );

  // if (existingUser) return { error: "Account is taken" };

  const user = { id, user: name, room, photoURL, email };

  usersInRooms.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = usersInRooms.findIndex((user) => user.id === id);

  if (index !== -1) return usersInRooms.splice(index, 1)[0];
};

const removeUserByEmail = (email) => {
  const index = usersInRooms.findIndex(
    (user) => user.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (index !== -1) return usersInRooms.splice(index, 1)[0];
};

const getUser = (id) => usersInRooms.find((user) => user.id === id);

const getUserByEmail = (email) => usersInRooms.find((user) => user.email.toLowerCase().trim() === email.toLowerCase().trim());

const getUsersInRoom = (room) => usersInRooms.filter((user) => user.room.toLowerCase().trim() === room.toLowerCase().trim());

module.exports = {
  addUser,
  removeUser,
  removeUserByEmail,
  getUser,
  getUserByEmail,
  getUsersInRoom,
};
