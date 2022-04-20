const { MongoClient } = require("mongodb");
const express = require("express");
require("express-async-errors");
const socketio = require("socket.io");
const http = require("http");
const logger = require("./services/logService");
const helmet = require("helmet");
const { encrypt, decrypt } = require("./utils/Cryptography");
const {
  addUser,
  removeUserByEmail,
  getUserByEmail,
  getUsersInRoom,
} = require("./data/users");
const {
  addTypingUser,
  removeTypingUserByEmail,
  getTypingUsersInRoom,
} = require("./data/typingUsers");
const {
  findOneItemByObject,
  findMultipleItemsByObject,
  create,
  updateObjectByObject,
  deleteByObject,
} = require("./services/databaseService");
const { clientPassKey } = require("./startup/config.json");

const { getDate } = require("./utils/getDate");

const uri =
  "mongodb+srv://never-finite-chatroom-admin:4RjGzhTbbcepwPGe@never-finite-chatroom.mpem8.mongodb.net/chatroom?retryWrites=true&w=majority";

const client = new MongoClient(uri);

const PORT = process.env.PORT || 5000;

logger.init();

const router = express.Router();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});
const { v4: uuidv4 } = require("uuid");

app.use(helmet());
require("./startup/cors")(app);
app.use(router);

const allSockets = [];

router.get("/", (req, res) => {
  res.send("Waiting for any connections...");
});

router.get("/:key/users", async (req, res) => {
  try {
    if (req.params.key === clientPassKey) {
      const result = await findMultipleItemsByObject(
        client,
        "chatroom",
        "users",
        {}
      );

      if (!result) return res.status(404).send("No users found");

      res.send(result);
    } else {
      return res
        .status(401)
        .send(
          "Don't care + didn't ask + L + Ratio + soyjak + beta + cringe + stfu + cope + seethe + ok boomer + incel + virgin + Karen + you are not just a clown, you are the entire circus + nah this ain't it + do better + check your privilege + pronouns in bio + anime pfp + the cognitive dissonance is real with this one + small dick energy + lol copium + snowflake + those tears taste delicious + Lisa Simpson meme template saying that your opinion is wrong + wojak meme in which I'm the chad + average your opinion fan vs average my opinion enjoyer + random k-pop fancam + cry more + how's your wife's boyfriend doing + Cheetos breath + Intelligence 0 + r/whooooosh + r/downvotedtooblivion + blocked and reported + yo Momma so fat + I fucked your mom last night + what zero pussy does to a mf + Jesse what the fuck are you talking about + holy shit go touch some grass + cry about it + get triggered"
        );
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/:key/users/:email", async (req, res) => {
  try {
    if (req.params.key === clientPassKey) {
      const result = await findOneItemByObject(client, "chatroom", "users", {
        email: encrypt(req.params.email),
      });

      if (!result)
        return res
          .status(404)
          .send(
            `The user with the email '${encrypt(
              req.params.email
            )}' was not found`
          );

      res.send(result);
    } else {
      return res
        .status(401)
        .send(
          "Don't care + didn't ask + L + Ratio + soyjak + beta + cringe + stfu + cope + seethe + ok boomer + incel + virgin + Karen + you are not just a clown, you are the entire circus + nah this ain't it + do better + check your privilege + pronouns in bio + anime pfp + the cognitive dissonance is real with this one + small dick energy + lol copium + snowflake + those tears taste delicious + Lisa Simpson meme template saying that your opinion is wrong + wojak meme in which I'm the chad + average your opinion fan vs average my opinion enjoyer + random k-pop fancam + cry more + how's your wife's boyfriend doing + Cheetos breath + Intelligence 0 + r/whooooosh + r/downvotedtooblivion + blocked and reported + yo Momma so fat + I fucked your mom last night + what zero pussy does to a mf + Jesse what the fuck are you talking about + holy shit go touch some grass + cry about it + get triggered"
        );
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/:key/rooms", async (req, res) => {
  try {
    if (req.params.key === clientPassKey) {
      const result = await findMultipleItemsByObject(
        client,
        "chatroom",
        "rooms",
        {}
      );

      if (!result) return res.status(404).send("No rooms found");

      res.send(result);
    } else {
      return res
        .status(401)
        .send(
          "Don't care + didn't ask + L + Ratio + soyjak + beta + cringe + stfu + cope + seethe + ok boomer + incel + virgin + Karen + you are not just a clown, you are the entire circus + nah this ain't it + do better + check your privilege + pronouns in bio + anime pfp + the cognitive dissonance is real with this one + small dick energy + lol copium + snowflake + those tears taste delicious + Lisa Simpson meme template saying that your opinion is wrong + wojak meme in which I'm the chad + average your opinion fan vs average my opinion enjoyer + random k-pop fancam + cry more + how's your wife's boyfriend doing + Cheetos breath + Intelligence 0 + r/whooooosh + r/downvotedtooblivion + blocked and reported + yo Momma so fat + I fucked your mom last night + what zero pussy does to a mf + Jesse what the fuck are you talking about + holy shit go touch some grass + cry about it + get triggered"
        );
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/:key/rooms/:room", async (req, res) => {
  try {
    if (req.params.key === clientPassKey) {
      const result = await findOneItemByObject(client, "chatroom", "rooms", {
        room: encrypt(req.params.room),
      });

      if (!result)
        return res
          .status(404)
          .send(
            `The room with the name '${encrypt(req.params.room)}' was not found`
          );

      res.send(result);
    } else {
      return res
        .status(401)
        .send(
          "Don't care + didn't ask + L + Ratio + soyjak + beta + cringe + stfu + cope + seethe + ok boomer + incel + virgin + Karen + you are not just a clown, you are the entire circus + nah this ain't it + do better + check your privilege + pronouns in bio + anime pfp + the cognitive dissonance is real with this one + small dick energy + lol copium + snowflake + those tears taste delicious + Lisa Simpson meme template saying that your opinion is wrong + wojak meme in which I'm the chad + average your opinion fan vs average my opinion enjoyer + random k-pop fancam + cry more + how's your wife's boyfriend doing + Cheetos breath + Intelligence 0 + r/whooooosh + r/downvotedtooblivion + blocked and reported + yo Momma so fat + I fucked your mom last night + what zero pussy does to a mf + Jesse what the fuck are you talking about + holy shit go touch some grass + cry about it + get triggered"
        );
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/:key/rooms/onlineUsers/:room", async (req, res) => {
  try {
    if (req.params.key === clientPassKey) {
      res.send(getUsersInRoom(req.params.room));
    } else {
      return res
        .status(401)
        .send(
          "Don't care + didn't ask + L + Ratio + soyjak + beta + cringe + stfu + cope + seethe + ok boomer + incel + virgin + Karen + you are not just a clown, you are the entire circus + nah this ain't it + do better + check your privilege + pronouns in bio + anime pfp + the cognitive dissonance is real with this one + small dick energy + lol copium + snowflake + those tears taste delicious + Lisa Simpson meme template saying that your opinion is wrong + wojak meme in which I'm the chad + average your opinion fan vs average my opinion enjoyer + random k-pop fancam + cry more + how's your wife's boyfriend doing + Cheetos breath + Intelligence 0 + r/whooooosh + r/downvotedtooblivion + blocked and reported + yo Momma so fat + I fucked your mom last night + what zero pussy does to a mf + Jesse what the fuck are you talking about + holy shit go touch some grass + cry about it + get triggered"
        );
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/:key/messages", async (req, res) => {
  try {
    if (req.params.key === clientPassKey) {
      const result = await findMultipleItemsByObject(
        client,
        "chatroom",
        "messages",
        {}
      );

      if (!result) return res.status(404).send("No messages found");

      res.send(result);
    } else {
      return res
        .status(401)
        .send(
          "Don't care + didn't ask + L + Ratio + soyjak + beta + cringe + stfu + cope + seethe + ok boomer + incel + virgin + Karen + you are not just a clown, you are the entire circus + nah this ain't it + do better + check your privilege + pronouns in bio + anime pfp + the cognitive dissonance is real with this one + small dick energy + lol copium + snowflake + those tears taste delicious + Lisa Simpson meme template saying that your opinion is wrong + wojak meme in which I'm the chad + average your opinion fan vs average my opinion enjoyer + random k-pop fancam + cry more + how's your wife's boyfriend doing + Cheetos breath + Intelligence 0 + r/whooooosh + r/downvotedtooblivion + blocked and reported + yo Momma so fat + I fucked your mom last night + what zero pussy does to a mf + Jesse what the fuck are you talking about + holy shit go touch some grass + cry about it + get triggered"
        );
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/:key/messages/:room", async (req, res) => {
  try {
    if (req.params.key === clientPassKey) {
      const result = await findMultipleItemsByObject(
        client,
        "chatroom",
        "messages",
        {
          room: encrypt(req.params.room),
        }
      );

      if (!result)
        return res
          .status(404)
          .send(
            `No messages in the room, '${encrypt(req.params.room)}' were found`
          );

      res.send(result);
    } else {
      return res
        .status(401)
        .send(
          "Don't care + didn't ask + L + Ratio + soyjak + beta + cringe + stfu + cope + seethe + ok boomer + incel + virgin + Karen + you are not just a clown, you are the entire circus + nah this ain't it + do better + check your privilege + pronouns in bio + anime pfp + the cognitive dissonance is real with this one + small dick energy + lol copium + snowflake + those tears taste delicious + Lisa Simpson meme template saying that your opinion is wrong + wojak meme in which I'm the chad + average your opinion fan vs average my opinion enjoyer + random k-pop fancam + cry more + how's your wife's boyfriend doing + Cheetos breath + Intelligence 0 + r/whooooosh + r/downvotedtooblivion + blocked and reported + yo Momma so fat + I fucked your mom last night + what zero pussy does to a mf + Jesse what the fuck are you talking about + holy shit go touch some grass + cry about it + get triggered"
        );
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

io.on("connection", (socket) => {
  let userEmailSocketScope = "";
  let userActiveRoomSocketScope = "";

  socket.on("userOnline", async ({ name, photoURL, email }) => {
    try {
      console.log(`${name} has gotten online!`);

      const result = await findOneItemByObject(client, "chatroom", "users", {
        email,
      });

      const user = {
        user: name,
        photoURL,
        email,
        accountStatus: `Hello! My name is ${decrypt(name)}!`,
      };

      if (!result) {
        await create(client, "chatroom", "users", user);
      }

      allSockets.push({ socket, ...user });

      userEmailSocketScope = email;

      socket.emit("userInfo");
    } catch (e) {
      logger.log(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("deleteRoom", async ({ email, room }) => {
    try {
      console.log(`${email} has deleted the room '${room}'.`);

      const user = removeUserByEmail(email);

      if (user) {
        console.log(`${user.user} (${email}) has left the room, ${room}.`);

        const userInDB = await findOneItemByObject(
          client,
          "chatroom",
          "users",
          {
            email,
          }
        );

        let newRooms = [...userInDB.rooms];

        if (userInDB.rooms) {
          let index = "";
          for (let i = 0; i < userInDB.rooms.length; i++) {
            if (userInDB.rooms[i].room === room) {
              index = i;
            }
          }

          newRooms.splice(index, 1);
        }

        updateObjectByObject(
          client,
          "chatroom",
          "users",
          { email },
          {
            rooms: newRooms,
          }
        );

        const result = await findOneItemByObject(client, "chatroom", "rooms", {
          room,
        });

        if (result.users.length <= 1) {
          // Delete the room
          deleteByObject(client, "chatroom", "rooms", {
            room,
          });
          console.log(`The room ${room} has been deleted.`);
        } else {
          io.to(user.room).emit("roomData", {
            users: getUsersInRoom(room),
          });

          const uid = uuidv4() + "-" + Date.now().toString();

          const formatted_date = getDate();

          socket.broadcast.to(room).emit("message", {
            user: encrypt("Admin"),
            email: "",
            text: encrypt(`${user.user} has left the room.`),
            photoURL: encrypt(
              "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png"
            ),
            createdAtDisplay: formatted_date,
            uid,
            room: encrypt(room),
            createdAt: Date.now(),
            media: "",
            mediaPath: "",
            isEdited: false,
          });

          const roomResult = await findOneItemByObject(
            client,
            "chatroom",
            "rooms",
            {
              room,
            }
          );

          let newUsers = [...roomResult.users];

          if (roomResult.users) {
            let index = "";
            for (let i = 0; i < roomResult.users.length; i++) {
              if (roomResult.users[i].email === email) {
                index = i;
              }
            }

            newUsers.splice(index, 1);
          }

          updateObjectByObject(
            client,
            "chatroom",
            "rooms",
            { room },
            {
              users: newUsers,
            }
          );
        }
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("inviteUsers", ({ room, selectedUsersToInvite }) => {
    try {
      selectedUsersToInvite.forEach(async (email) => {
        let shouldInvite = true;

        const rooms = await findMultipleItemsByObject(
          client,
          "chatroom",
          "rooms",
          {}
        );

        rooms.forEach((roomLooped) => {
          if (
            roomLooped.room === room &&
            roomLooped.invitedUsers &&
            roomLooped.invitedUsers.includes(email)
          ) {
            shouldInvite = false;
          }
        });

        if (shouldInvite) {
          const { invitedUsers } = await findOneItemByObject(
            client,
            "chatroom",
            "rooms",
            { room: room }
          );

          const newInvitedUsers = invitedUsers
            ? [...invitedUsers, email]
            : [email];

          await updateObjectByObject(
            client,
            "chatroom",
            "rooms",
            { room: room },
            { invitedUsers: newInvitedUsers }
          );

          const userInDB = await findOneItemByObject(
            client,
            "chatroom",
            "users",
            { email: email }
          );

          if (userInDB) {
            const newInvites = userInDB.invites
              ? [...userInDB.invites, room]
              : [room];

            await updateObjectByObject(
              client,
              "chatroom",
              "users",
              { email: email },
              { invites: newInvites }
            );

            const userSocketInArray = allSockets.find(
              (socketLooped) => socketLooped.email === email
            );

            if (userSocketInArray) {
              console.log("User to invite found");
              if (userSocketInArray.socket) {
                console.log("User socket to invite found");
                userSocketInArray.socket.emit("inviteToRoom");
              }
            } else {
              console.log("User to invite could not be found");
            }
          }
        }
      });
    } catch (e) {
      logger.log(e);
      console.log("Could not get invite users!", e);
    }
  });

  socket.on("ignoreRoomInvite", async ({ email, room }) => {
    try {
      const { invites } = await findOneItemByObject(
        client,
        "chatroom",
        "users",
        { email: email }
      );

      const newRoomInvites = [...invites];
      newRoomInvites.splice(invites.indexOf(room), 1);

      await updateObjectByObject(
        client,
        "chatroom",
        "users",
        { email: email },
        { invites: newRoomInvites }
      );
    } catch (e) {
      logger.log(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on(
    "joinRoom",
    async ({ name, room, photoURL, email, isPrivate, lastTimeOnline }) => {
      if (room) {
        try {
          let shouldAddRoomToUser = true;
          let shouldAddRoom = true;
          let shouldAddUserToRoom = true;

          console.log("join room:", email);

          let userInDB = await findOneItemByObject(
            client,
            "chatroom",
            "users",
            {
              email: email,
            }
          );

          if (userInDB && userInDB.rooms) {
            userInDB.rooms.forEach((loopedRoom) => {
              if (loopedRoom.room === room) {
                shouldAddRoomToUser = false;
              }
            });
          }

          const rooms = await findMultipleItemsByObject(
            client,
            "chatroom",
            "rooms",
            {}
          );

          rooms.forEach((roomLooped) => {
            if (roomLooped.room === room) {
              shouldAddRoom = false;
            }
          });

          const roomInDB = await findOneItemByObject(
            client,
            "chatroom",
            "rooms",
            {
              room,
            }
          );

          if (roomInDB) {
            roomInDB.users.forEach((user) => {
              if (user.email === email) {
                shouldAddUserToRoom = false;
              }
            });
          }

          userInDB = await findOneItemByObject(client, "chatroom", "users", {
            email: email,
          });

          if (shouldAddRoomToUser && userInDB) {
            let newRoomsInUser = userInDB.rooms
              ? [
                  ...userInDB.rooms,
                  {
                    room,
                    isPrivate,
                  },
                ]
              : [
                  {
                    room,
                    isPrivate,
                  },
                ];

            updateObjectByObject(
              client,
              "chatroom",
              "users",
              { email },
              { rooms: newRoomsInUser }
            );
          }

          if (shouldAddRoom) {
            await create(client, "chatroom", "rooms", {
              room,
              isPrivate,
              users: [],
            });
          }

          if (shouldAddUserToRoom) {
            let newUsersInRoom = [];

            const roomInDBNew = await findOneItemByObject(
              client,
              "chatroom",
              "rooms",
              {
                room,
              }
            );

            userInDB = await findOneItemByObject(client, "chatroom", "users", {
              email: email,
            });

            if (userInDB) {
              if (roomInDBNew.users) {
                newUsersInRoom = [
                  ...roomInDBNew.users,
                  {
                    user: name,
                    photoURL,
                    email,
                    accountStatus: userInDB.accountStatus,
                  },
                ];
              } else {
                newUsersInRoom = [
                  {
                    user: name,
                    photoURL,
                    email,
                    accountStatus: userInDB.accountStatus,
                  },
                ];
              }
            }

            updateObjectByObject(
              client,
              "chatroom",
              "rooms",
              { room },
              { users: newUsersInRoom }
            );
          }

          // Invite the user to the room if they haven't already been invited
          let shouldInvite = true;

          const roomsInDB = await findMultipleItemsByObject(
            client,
            "chatroom",
            "rooms",
            {}
          );

          roomsInDB.forEach((roomLooped) => {
            if (
              roomLooped.room === room &&
              roomLooped.invitedUsers &&
              roomLooped.invitedUsers.includes(email)
            ) {
              shouldInvite = false;
            }
          });

          if (shouldInvite) {
            const { invitedUsers } = await findOneItemByObject(
              client,
              "chatroom",
              "rooms",
              { room }
            );

            if (invitedUsers) {
              const newInvitedUsers = invitedUsers
                ? [...invitedUsers, email]
                : [email];

              await updateObjectByObject(
                client,
                "chatroom",
                "rooms",
                { room: room },
                { invitedUsers: newInvitedUsers }
              );
            }
          }

          console.log(getUsersInRoom(room));
          console.log(email);
          for (let key in getUsersInRoom(room)) {
            if (
              getUsersInRoom(room) &&
              getUsersInRoom(room)[key] &&
              getUsersInRoom(room)[key].email &&
              getUsersInRoom(room)[key].email === email
            ) {
              removeUserByEmail(getUsersInRoom(room)[key].email);
            }
          }

          const { error, user } = addUser({
            id: socket.id,
            name,
            room,
            photoURL,
            email,
          });

          userActiveRoomSocketScope = room;

          if (error) {
            console.log(
              "An unexpected error has occurred while adding the user to the room!",
              error
            );
            return;
          }

          console.log("User has joined!", user);

          socket.join(room, function() {
            console.log(`User is now in rooms: ${socket.rooms}`);
          });

          const uid = uuidv4() + "-" + Date.now().toString();

          const formatted_date = getDate();

          if (shouldAddRoomToUser) {
            socket.emit("message", {
              room,
              user: encrypt("Admin"),
              photoURL: encrypt(
                "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png"
              ),
              email: encrypt("neverfinitetech@gmail.com"),
              media: "",
              createdAtDisplay: formatted_date,
              mediaPath: "",
              isEdited: false,
              uid,
              createdAt: Date.now(),
              text: encrypt("Welcome to the room!"),
            });
            socket.broadcast.to(user.room).emit("message", {
              room,
              user: encrypt("Admin"),
              photoURL: encrypt(
                "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png"
              ),
              email: encrypt("neverfinitetech@gmail.com"),
              media: "",
              createdAtDisplay: formatted_date,
              mediaPath: "",
              isEdited: false,
              uid,
              createdAt: Date.now(),
              text: encrypt(`${decrypt(user.user)} has joined the room`),
            });
          }

          io.to(user.room).emit("roomData", {
            users: getUsersInRoom(room),
          });

          userInDB = await findOneItemByObject(client, "chatroom", "users", {
            email: email,
          });

          if (userInDB && userInDB.rooms) {
            const newRooms = [...userInDB.rooms];

            for (let i = 0; i < newRooms.length; i++) {
              if (newRooms[i].room === room)
                newRooms[i].lastTimeOnline = lastTimeOnline;
            }

            // Update the last time online in DB
            await updateObjectByObject(
              client,
              "chatroom",
              "users",
              {
                email: email,
              },
              { rooms: newRooms }
            );
          }

          userInDB = await findOneItemByObject(client, "chatroom", "users", {
            email: email,
          });

          if (userInDB) {
            const roomsToSendToClient = [...userInDB.rooms];

            socket.emit("rooms", {
              rooms: roomsToSendToClient,
            });
          }

          console.log(getUsersInRoom(room));
        } catch (e) {
          logger.log(e);
          console.log("Could not join the room!", e);
        }
      }
    }
  );

  socket.on(
    "sendMessage",
    async (
      room,
      user,
      photoURL,
      email,
      message,
      createdAtDisplay,
      mediaPath,
      isMedia,
      uid,
      callback
    ) => {
      try {
        if (message && !isMedia) {
          console.log(message);
        }

        const createdAt = Date.now();

        await create(client, "chatroom", "messages", {
          user,
          room,
          photoURL,
          email,
          createdAt,
          createdAtDisplay,
          text: isMedia ? "" : message,
          media: isMedia ? message : "",
          mediaPath: mediaPath,
          isEdited: false,
          uid,
        });

        io.to(room).emit("message", {
          user,
          room,
          photoURL,
          email,
          createdAt,
          createdAtDisplay,
          text: isMedia ? "" : message,
          media: isMedia ? message : "",
          mediaPath: mediaPath,
          isEdited: false,
          uid,
        });

        callback();
      } catch (e) {
        logger.log(e);
        console.log("Could not send message!", e);
      }
    }
  );

  socket.on("deleteMessage", async (uid, email) => {
    try {
      const user = getUserByEmail(email);

      await deleteByObject(client, "chatroom", "messages", {
        uid,
      });

      io.to(user.room).emit("delete", {
        uid,
      });
    } catch (e) {
      logger.log(e);
      console.log("Could not delete message!", e);
    }
  });

  socket.on(
    "editMessage",
    async (uid, newMessage, newCreatedAtDisplay, email) => {
      try {
        const user = getUserByEmail(email);

        await updateObjectByObject(
          client,
          "chatroom",
          "messages",
          {
            uid,
          },
          {
            text: newMessage,
            createdAtDisplay: newCreatedAtDisplay,
            isEdited: true,
          }
        );

        io.to(user.room).emit("edit", {
          uid,
          newMessage,
          newCreatedAtDisplay,
        });
      } catch (e) {
        logger.log(e);
        console.log("Could not edit message!", e);
      }
    }
  );

  socket.on("newAccountStatus", async ({ email, accountStatus }) => {
    try {
      console.log(
        `${email} has changed their account status to: ${accountStatus}.`
      );

      await updateObjectByObject(
        client,
        "chatroom",
        "users",
        {
          email,
        },
        { accountStatus }
      );

      const rooms = await findMultipleItemsByObject(
        client,
        "chatroom",
        "rooms",
        {}
      );

      rooms.forEach((room) => {
        if (room.users) {
          room.users.forEach(async (user) => {
            if (user.email === email) {
              const newUsers = [...room.users];
              for (let key in newUsers) {
                if (newUsers[key].email === email) {
                  newUsers[key].accountStatus = accountStatus;
                }
              }

              await updateObjectByObject(
                client,
                "chatroom",
                "rooms",
                {
                  room: room.room,
                },
                { users: newUsers }
              );
            }
          });
        }
      });
    } catch (e) {
      logger.log(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("startTypingMessage", ({ room, email, user }) => {
    try {
      if (room && email && user && decrypt(user) !== "admin") {
        addTypingUser({
          room,
          email,
          user,
        });

        io.to(room).emit("startTypingMessage", {
          typingUsersProp: getTypingUsersInRoom(room),
        });
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not start typing message!", e);
    }
  });

  socket.on("stopTypingMessage", ({ room, email }) => {
    try {
      if (room && email) {
        removeTypingUserByEmail(email);

        io.to(room).emit("stopTypingMessage", {
          typingUsersProp: getTypingUsersInRoom(room),
        });
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not stop typing message!", e);
    }
  });

  socket.on("disconnect", async () => {
    console.log("disconnect:", userEmailSocketScope);

    try {
      if (userActiveRoomSocketScope && userEmailSocketScope) {
        removeTypingUserByEmail(userEmailSocketScope);
        io.to(userActiveRoomSocketScope).emit("stopTypingMessage", {
          typingUsers: getTypingUsersInRoom(userActiveRoomSocketScope),
        });
      }

      if (userEmailSocketScope) {
        if (userActiveRoomSocketScope) {
          let lastTimeOnlineInRoom = Date.now();

          const usersInRoomFiltered = [
            ...getUsersInRoom(userActiveRoomSocketScope).filter(
              (user) => user.email === userEmailSocketScope
            ),
          ];
          console.log(usersInRoomFiltered);
          const user = removeUserByEmail(userEmailSocketScope);

          socket.leave(userActiveRoomSocketScope, () => {
            console.log(`User is now in rooms: ${socket.rooms}`);
          });

          if (user) {
            if (usersInRoomFiltered.length <= 1) {
              console.log(
                `${user.user} (${userEmailSocketScope}) has left the room, ${userActiveRoomSocketScope}.`
              );

              io.to(userActiveRoomSocketScope).emit("roomData", {
                users: getUsersInRoom(userActiveRoomSocketScope),
              });

              const userInDB = await findOneItemByObject(
                client,
                "chatroom",
                "users",
                { email: userEmailSocketScope }
              );

              if (userInDB) {
                const newRooms = [...userInDB.rooms];

                for (let i = 0; i < newRooms.length; i++) {
                  if (newRooms[i].room === userActiveRoomSocketScope) {
                    newRooms[i].lastTimeOnline = lastTimeOnlineInRoom;
                  }
                }

                // Update the last time online in DB
                await updateObjectByObject(
                  client,
                  "chatroom",
                  "users",
                  {
                    email: userEmailSocketScope,
                  },
                  { rooms: newRooms }
                );
              }
            }
          }
        }

        console.log(`${userEmailSocketScope} has disconnected.`);

        const allSocketsEmails = allSockets.map(
          (socketLooped) => socketLooped.email
        );
        allSockets.splice(allSocketsEmails.indexOf(userEmailSocketScope), 1);
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not disconnect", e);
    }
  });

  socket.on("leftRoom", async ({ lastTimeOnline, email, room }) => {
    try {
      if (room && email) {
        removeTypingUserByEmail(email);
        io.to(room).emit("stopTypingMessage", {
          typingUsers: getTypingUsersInRoom(room),
        });
      }

      const usersInRoomFiltered = [
        ...getUsersInRoom(userActiveRoomSocketScope).filter(
          (user) => user.email === userEmailSocketScope
        ),
      ];
      console.log(usersInRoomFiltered);
      const user = removeUserByEmail(email);

      socket.leave(userActiveRoomSocketScope, () => {
        console.log(`User is now in rooms: ${socket.rooms}`);
      });

      if (user) {
        if (usersInRoomFiltered.length <= 1) {
          console.log(`${user.user} (${email}) has left the room, ${room}.`);

          io.to(user.room).emit("roomData", {
            users: getUsersInRoom(room),
          });

          const userInDB = await findOneItemByObject(
            client,
            "chatroom",
            "users",
            { email: email }
          );

          if (userInDB) {
            const newRooms = [...userInDB.rooms];

            for (let i = 0; i < newRooms.length; i++) {
              if (newRooms[i].room === room) {
                newRooms[i].lastTimeOnline = lastTimeOnline;
              }
            }

            // Update the last time online in DB
            await updateObjectByObject(
              client,
              "chatroom",
              "users",
              {
                email: email,
              },
              { rooms: newRooms }
            );
          }
        }
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not leave room.", e);
    }
  });
});

server.listen(PORT, async () => {
  try {
    await client.connect();

    console.log(`Listening on port ${PORT}`);
  } catch (e) {
    console.error(e);
  }
});
