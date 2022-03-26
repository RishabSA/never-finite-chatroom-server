const typingUsersInRooms = [];

const addTypingUser = ({ room, email, user }) => {
  room = room;
  email = email;
  user = user;

  const existingUser = typingUsersInRooms.find(
    (user) => user.room === room && user.email === email
  );

  if (existingUser) return { error: "User is already typing" };

  const user = {
    user,
    room: room.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
  };

  typingUsersInRooms.push(user);

  return { user };
};

const removeTypingUserByEmail = (email) => {
  const index = typingUsersInRooms.findIndex(
    (user) => user.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (index !== -1) return typingUsersInRooms.splice(index, 1)[0];
};

const getTypingUserByEmail = (email) =>
  typingUsersInRooms.find(
    (user) => user.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

const getTypingUsersInRoom = (room) =>
  typingUsersInRooms.filter(
    (user) => user.room.toLowerCase().trim() === room.toLowerCase().trim()
  );

module.exports = {
  addTypingUser,
  removeTypingUserByEmail,
  getTypingUserByEmail,
  getTypingUsersInRoom,
};
