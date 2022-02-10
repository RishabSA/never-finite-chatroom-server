const users = [];

const addUser = ({ id, name, room, photoURL, email }) => {
  name = name;
  room = room;
  photoURL = photoURL;
  email = email;

  const existingUser = users.find(
    (user) => user.room === room && user.email === email
  );

  if (existingUser) return { error: "Account is taken" };

  const user = { id, user: name, room, photoURL, email };

  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const removeUserByEmail = (email) => {
  const index = users.findIndex(
    (user) => user.email.toLowerCase().trim() === email.toLowerCase().trim()
  );
  console.log(index);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUserByEmail = (email) => users.find((user) => user.email.toLowerCase().trim() === email.toLowerCase().trim());

const getUsersInRoom = (room) => users.filter((user) => user.room.toLowerCase().trim() === room.toLowerCase().trim());

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserByEmail,
  getUsersInRoom,
  removeUserByEmail,
};
