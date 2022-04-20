const typingUsersInRooms = [];

const addTypingUser = ({ room, email, user }) => {
  room = room;
  email = email;
  user = user;

  const existingUser = typingUsersInRooms.find(
    (user) => user.room === room && user.email === email
  );

  if (existingUser) return { error: "User is already typing" };

  const userInArray = {
    user,
    room,
    email,
  };

  typingUsersInRooms.push(userInArray);

  //console.log("Array affter add typing user:", typingUsersInRooms);

  return { userInArray };
};

const removeTypingUserByEmail = (email) => {
  const index = typingUsersInRooms.findIndex(
    (user) => user.email === email
  );

  if (index !== -1) return typingUsersInRooms.splice(index, 1)[0];
};

const getTypingUserByEmail = (email) =>
  typingUsersInRooms.find(
    (user) => user.email === email
  );

const getTypingUsersInRoom = (room) =>
  typingUsersInRooms.filter(
    (user) => user.room === room
  );

module.exports = {
  addTypingUser,
  removeTypingUserByEmail,
  getTypingUserByEmail,
  getTypingUsersInRoom,
};
