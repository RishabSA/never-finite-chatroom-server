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
  res.send("Waiting for connections...");
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
        email: req.params.email,
      });

      if (!result)
        return res
          .status(404)
          .send(`The user with the email '${req.params.email}' was not found`);

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
        room: req.params.room,
      });

      if (!result)
        return res
          .status(404)
          .send(`The room with the name '${req.params.room}' was not found`);

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
          room: req.params.room,
        }
      );

      if (!result)
        return res
          .status(404)
          .send(`No messages in the room, '${req.params.room}' were found`);

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
        accountStatus: `Hello! My name is ${name}!`,
      };

      if (!result) {
        await create(client, "chatroom", "users", user);
      }

      allSockets.push({ socket, ...user });

      userEmailSocketScope = email.toLowerCase().trim();

      console.log(allSockets);

      socket.emit("userInfo");
    } catch (e) {
      logger.log(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("deleteRoom", async ({ email, room }) => {
    try {
      console.log(`${email} has deleted the room '${room}'.`);

      const user = removeUserByEmail(email.toLowerCase().trim());

      if (user) {
        console.log(`${user.user} (${email}) has left the room, ${room}.`);

        io.to(user.room).emit("roomData", {
          users: getUsersInRoom(room.toLowerCase().trim()),
        });

        let uid = uuidv4();

        const formatted_date = getDate();

        socket.broadcast.to(room).emit("message", {
          user: "Admin",
          email: "",
          text: encrypt(`${user.user} has left the room.`),
          photoURL:
            "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
          createdAtDisplay: formatted_date,
          uid,
          room,
          createdAt: Date.now(),
          media: "",
          mediaPath: "",
          isEdited: false,
        });
      }

      const userInDB = await findOneItemByObject(client, "chatroom", "users", {
        email,
      });

      let newRooms = [...userInDB.rooms];

      if (userInDB.rooms) {
        let index = "";
        for (let i = 0; i < userInDB.rooms.length; i++) {
          if (
            userInDB.rooms[i].room.toLowerCase().trim() ===
            room.trim().toLowerCase()
          ) {
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
          if (
            roomResult.users[i].email.toLowerCase().trim() ===
            email.trim().toLowerCase()
          ) {
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
            roomLooped.room.toLowerCase().trim() ===
              room.toLowerCase().trim() &&
            roomLooped.invitedUsers &&
            roomLooped.invitedUsers.includes(email.toLowerCase().trim())
          ) {
            shouldInvite = false;
          }
        });

        if (shouldInvite) {
          const { invitedUsers } = await findOneItemByObject(
            client,
            "chatroom",
            "rooms",
            { room: room.toLowerCase().trim() }
          );

          const newInvitedUsers = invitedUsers
            ? [...invitedUsers, email.toLowerCase().trim()]
            : [email.toLowerCase().trim()];

          await updateObjectByObject(
            client,
            "chatroom",
            "rooms",
            { room: room.toLowerCase().trim() },
            { invitedUsers: newInvitedUsers }
          );

          const userInDB = await findOneItemByObject(
            client,
            "chatroom",
            "users",
            { email: email.toLowerCase().trim() }
          );

          if (userInDB) {
            const newInvites = userInDB.invites
              ? [...userInDB.invites, room.toLowerCase().trim()]
              : [room.toLowerCase().trim()];

            await updateObjectByObject(
              client,
              "chatroom",
              "users",
              { email: email.toLowerCase().trim() },
              { invites: newInvites }
            );

            const userSocketInArray = allSockets.find(
              (socketLooped) =>
                socketLooped.email.toLowerCase().trim() ===
                email.toLowerCase().trim()
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
      console.log("Could not get online!", e);
    }
  });

  socket.on("ignoreRoomInvite", async ({ email, room }) => {
    try {
      const { invites } = await findOneItemByObject(
        client,
        "chatroom",
        "users",
        { email: email.toLowerCase().trim() }
      );

      const newRoomInvites = [...invites];
      newRoomInvites.splice(invites.indexOf(room.toLowerCase().trim()), 1);

      await updateObjectByObject(
        client,
        "chatroom",
        "users",
        { email: email.toLowerCase().trim() },
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
              email: email.toLowerCase().trim(),
            }
          );

          if (userInDB && userInDB.rooms) {
            userInDB.rooms.forEach((loopedRoom) => {
              if (
                loopedRoom.room.toLowerCase().trim() ===
                room.toLowerCase().trim()
              ) {
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
            if (
              roomLooped.room.toLowerCase().trim() === room.trim().toLowerCase()
            ) {
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
              if (
                user.email.toLowerCase().trim() === email.toLowerCase().trim()
              ) {
                shouldAddUserToRoom = false;
              }
            });
          }

          userInDB = await findOneItemByObject(client, "chatroom", "users", {
            email: email.toLowerCase().trim(),
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
              email: email.toLowerCase().trim(),
            });

            if (userInDB) {
              if (roomInDBNew.users) {
                newUsersInRoom = [
                  ...roomInDBNew.users,
                  {
                    user: name,
                    photoURL,
                    email: email.trim().toLowerCase(),
                    accountStatus: userInDB.accountStatus,
                  },
                ];
              } else {
                newUsersInRoom = [
                  {
                    user: name,
                    photoURL,
                    email: email.trim().toLowerCase(),
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
              roomLooped.room.toLowerCase().trim() ===
                room.toLowerCase().trim() &&
              roomLooped.invitedUsers &&
              roomLooped.invitedUsers.includes(email.toLowerCase().trim())
            ) {
              shouldInvite = false;
            }
          });

          if (shouldInvite) {
            const { invitedUsers } = await findOneItemByObject(
              client,
              "chatroom",
              "rooms",
              { room: room.toLowerCase().trim() }
            );

            const newInvitedUsers = invitedUsers
              ? [...invitedUsers, email.toLowerCase().trim()]
              : [email.toLowerCase().trim()];

            await updateObjectByObject(
              client,
              "chatroom",
              "rooms",
              { room: room.toLowerCase().trim() },
              { invitedUsers: newInvitedUsers }
            );
          }

          console.log(getUsersInRoom(room.toLowerCase().trim()));
          console.log(email.toLowerCase().trim());
          for (let key in getUsersInRoom(room.toLowerCase().trim())) {
            if (
              getUsersInRoom(room.toLowerCase().trim()) &&
              getUsersInRoom(room.toLowerCase().trim())[key] &&
              getUsersInRoom(room.toLowerCase().trim())[key].email &&
              getUsersInRoom(room.toLowerCase().trim())
                [key].email.toLowerCase()
                .trim() === email.toLowerCase().trim()
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

          userActiveRoomSocketScope = room.toLowerCase().trim();

          if (error) {
            console.log(
              "An unexpected error has occurred while adding the user to the room!",
              error
            );
            return;
          }

          console.log("User has joined!", user);

          socket.join(user.room);

          let uid = uuidv4();

          const formatted_date = getDate();

          if (shouldAddRoomToUser) {
            socket.emit("message", {
              user: "Admin",
              email: "",
              text: encrypt("Welcome to the room!"),
              photoURL:
                "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
              createdAtDisplay: formatted_date,
              uid,
              room,
              createdAt: Date.now(),
              media: "",
              mediaPath: "",
              isEdited: false,
            });
            socket.broadcast.to(user.room).emit("message", {
              user: "Admin",
              email: "",
              text: encrypt(`${user.user} has joined the room!`),
              photoURL:
                "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
              createdAtDisplay: formatted_date,
              uid,
              room,
              createdAt: Date.now(),
              media: "",
              mediaPath: "",
              isEdited: false,
            });
          }

          io.to(user.room).emit("roomData", {
            users: getUsersInRoom(user.room),
          });

          userInDB = await findOneItemByObject(client, "chatroom", "users", {
            email: email.toLowerCase().trim(),
          });

          if (userInDB && userInDB.rooms) {
            const newRooms = [...userInDB.rooms];

            for (let i = 0; i < newRooms.length; i++) {
              if (
                newRooms[i].room.toLowerCase().trim() ===
                room.toLowerCase().trim()
              )
                newRooms[i].lastTimeOnline = lastTimeOnline;
            }

            // Update the last time online in DB
            await updateObjectByObject(
              client,
              "chatroom",
              "users",
              {
                email: email.toLowerCase().trim(),
              },
              { rooms: newRooms }
            );
          }

          userInDB = await findOneItemByObject(client, "chatroom", "users", {
            email: email.toLowerCase().trim(),
          });

          if (userInDB) {
            const roomsToSendToClient = [...userInDB.rooms];

            socket.emit("rooms", {
              rooms: roomsToSendToClient,
            });
          }

          console.log(getUsersInRoom(room.toLowerCase().trim()));
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
          console.log(decrypt(message));
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
          uid: uid + createdAt,
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
          uid: uid + createdAt,
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
            if (
              user.email.toLowerCase().trim() === email.toLowerCase().trim()
            ) {
              const newUsers = [...room.users];
              for (let key in newUsers) {
                if (
                  newUsers[key].email.toLowerCase().trim() ===
                  email.toLowerCase().trim()
                ) {
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

  socket.on("startTypingMessage", ({ room, userEmail, userName }) => {
    try {
      if (
        room &&
        userEmail &&
        userName &&
        userName.toLowerCase().trim() !== "admin"
      ) {
        addTypingUser({
          room: room.toLowerCase().trim(),
          email: userEmail.toLowerCase().trim(),
          user: userName,
        });
        io.to(room.toLowerCase().trim()).emit("startTypingMessage", {
          typingUsers: getTypingUsersInRoom(room.toLowerCase().trim()),
        });
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not start typing message!", e);
    }
  });

  socket.on("stopTypingMessage", ({ room, userEmail }) => {
    try {
      if (room && userEmail) {
        removeTypingUserByEmail(userEmail.toLowerCase().trim());
        io.to(room.toLowerCase().trim()).emit("stopTypingMessage", {
          typingUsers: getTypingUsersInRoom(room.toLowerCase().trim()),
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
        removeTypingUserByEmail(userEmailSocketScope.toLowerCase().trim());
        io.to(userActiveRoomSocketScope.toLowerCase().trim()).emit(
          "stopTypingMessage",
          {
            typingUsers: getTypingUsersInRoom(
              userActiveRoomSocketScope.toLowerCase().trim()
            ),
          }
        );
      }

      if (userEmailSocketScope) {
        if (userActiveRoomSocketScope) {
          let lastTimeOnlineInRoom = Date.now();

          const usersInRoomFiltered = getUsersInRoom(userActiveRoomSocketScope.toLowerCase().trim()).filter(
            (user) =>
              user.email.toLowerCase().trim() === userEmailSocketScope.toLowerCase().trim()
          );
          console.log(usersInRoomFiltered);
          const user = removeUserByEmail(
            userEmailSocketScope.toLowerCase().trim()
          );

          if (user) {
            if (usersInRoomFiltered.length <= 1) {
              console.log(
                `${user.user} (${userEmailSocketScope
                  .toLowerCase()
                  .trim()}) has left the room, ${userActiveRoomSocketScope
                  .toLowerCase()
                  .trim()}.`
              );

              io.to(userActiveRoomSocketScope.toLowerCase().trim()).emit(
                "roomData",
                {
                  users: getUsersInRoom(
                    userActiveRoomSocketScope
                      .toLowerCase()
                      .trim()
                      .toLowerCase()
                      .trim()
                  ),
                }
              );

              const userInDB = await findOneItemByObject(
                client,
                "chatroom",
                "users",
                { email: userEmailSocketScope.toLowerCase().trim() }
              );

              if (userInDB) {
                const newRooms = [...userInDB.rooms];

                for (let i = 0; i < newRooms.length; i++) {
                  if (
                    newRooms[i].room.toLowerCase().trim() ===
                    userActiveRoomSocketScope
                      .toLowerCase()
                      .trim()
                      .toLowerCase()
                      .trim()
                  ) {
                    newRooms[i].lastTimeOnline = lastTimeOnlineInRoom;
                  }
                }

                // Update the last time online in DB
                await updateObjectByObject(
                  client,
                  "chatroom",
                  "users",
                  {
                    email: userEmailSocketScope.toLowerCase().trim(),
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
        allSockets.splice(
          allSocketsEmails.indexOf(userEmailSocketScope.toLowerCase().trim()),
          1
        );
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not disconnect", e);
    }
  });

  socket.on("leftRoom", async ({ lastTimeOnline, email, room }) => {
    try {
      if (room && email) {
        removeTypingUserByEmail(email.toLowerCase().trim());
        io.to(room.toLowerCase().trim()).emit("stopTypingMessage", {
          typingUsers: getTypingUsersInRoom(room.toLowerCase().trim()),
        });
      }

      const usersInRoomFiltered = getUsersInRoom(room.toLowerCase().trim()).filter(
        (user) => user.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      console.log(usersInRoomFiltered);
      const user = removeUserByEmail(email.toLowerCase().trim());

      if (user) {
        if (usersInRoomFiltered.length <= 1) {
          console.log(`${user.user} (${email}) has left the room, ${room}.`);

          io.to(user.room).emit("roomData", {
            users: getUsersInRoom(room.toLowerCase().trim()),
          });

          const userInDB = await findOneItemByObject(
            client,
            "chatroom",
            "users",
            { email: email.toLowerCase().trim() }
          );

          if (userInDB) {
            const newRooms = [...userInDB.rooms];

            for (let i = 0; i < newRooms.length; i++) {
              if (
                newRooms[i].room.toLowerCase().trim() ===
                room.toLowerCase().trim()
              ) {
                newRooms[i].lastTimeOnline = lastTimeOnline;
              }
            }

            // Update the last time online in DB
            await updateObjectByObject(
              client,
              "chatroom",
              "users",
              {
                email: email.toLowerCase().trim(),
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
