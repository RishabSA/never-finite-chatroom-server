const mongoose = require("mongoose");
const RoomModel = require("./models/room");
const UserModel = require("./models/user");
const MessageModel = require("./models/message");
const express = require("express");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile, deleteFile, getFileStream } = require("./s3");
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
  deleteManyByObject,
} = require("./services/databaseService");
const { clientPassKey } = require("./startup/config.json");

const { getDate } = require("./utils/getDate");

const uri =
  "mongodb+srv://never-finite-chatroom-admin:4RjGzhTbbcepwPGe@never-finite-chatroom.mpem8.mongodb.net/chatroom?retryWrites=true&w=majority";

mongoose.connect(uri);

const PORT = process.env.PORT || 5000;

logger.init();

const router = express.Router();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 5e6,
});
const { v4: uuidv4 } = require("uuid");

// Use helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
require("./startup/cors")(app);
//app.use(restrictHeaderMiddlewareFunction);
app.use(router);

const allSockets = [];

function restrictHeaderMiddlewareFunction(req, res, next) {
  if (req.headers["access-key"] === clientPassKey) {
    next();
  } else {
    res.sendStatus(403);
  }
}

router.get("/", (req, res) => {
  res.send("Waiting for any connections...");
});

router.get(
  "/:key/users",
  restrictHeaderMiddlewareFunction,
  async (req, res) => {
    try {
      if (req.params.key === clientPassKey) {
        const result = await findMultipleItemsByObject(UserModel, {});

        if (!result) return res.status(404).send("No users found");

        res.send(result);
      } else {
        return res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: e.message });
    }
  }
);

router.get(
  "/:key/users/:email",
  restrictHeaderMiddlewareFunction,
  async (req, res) => {
    try {
      if (req.params.key === clientPassKey) {
        const result = await findOneItemByObject(UserModel, {
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
        return res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: e.message });
    }
  }
);

router.get(
  "/:key/rooms",
  restrictHeaderMiddlewareFunction,
  async (req, res) => {
    try {
      if (req.params.key === clientPassKey) {
        const result = await findMultipleItemsByObject(RoomModel, {});

        if (!result) return res.status(404).send("No rooms found");

        res.send(result);
      } else {
        return res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: e.message });
    }
  }
);

router.get(
  "/:key/rooms/:room",
  restrictHeaderMiddlewareFunction,
  async (req, res) => {
    try {
      if (req.params.key === clientPassKey) {
        const result = await findOneItemByObject(RoomModel, {
          room: encrypt(req.params.room),
        });

        if (!result)
          return res
            .status(404)
            .send(
              `The room with the name '${encrypt(
                req.params.room
              )}' was not found`
            );

        res.send(result);
      } else {
        return res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: e.message });
    }
  }
);

router.get(
  "/:key/rooms/onlineUsers/:room",
  restrictHeaderMiddlewareFunction,
  async (req, res) => {
    try {
      if (req.params.key === clientPassKey) {
        res.send(getUsersInRoom(req.params.room));
      } else {
        return res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: e.message });
    }
  }
);

router.get(
  "/:key/messages",
  restrictHeaderMiddlewareFunction,
  async (req, res) => {
    try {
      if (req.params.key === clientPassKey) {
        const result = await findMultipleItemsByObject(MessageModel, {});

        if (!result) return res.status(404).send("No messages found");

        res.send(result);
      } else {
        return res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: e.message });
    }
  }
);

router.get(
  "/:key/messages/:room",
  restrictHeaderMiddlewareFunction,
  async (req, res) => {
    try {
      if (req.params.key === clientPassKey) {
        const result = await findMultipleItemsByObject(MessageModel, {
          room: encrypt(req.params.room),
        });

        if (!result) return res.status(404);

        res.send(result);
      } else {
        return res.status(401);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: e.message });
    }
  }
);

router.get("/:clientPassKey/images/:key", (req, res) => {
  if (req.params.clientPassKey === clientPassKey) {
    const key = req.params.key;
    const readStream = getFileStream(key);

    readStream.pipe(res);
  } else {
    return res.status(401);
  }
});

router.post(
  "/:key/images",
  restrictHeaderMiddlewareFunction,
  upload.single("image"),
  async (req, res) => {
    if (req.params.key === clientPassKey) {
      const file = req.file;
      const result = await uploadFile(file);
      await unlinkFile(file.path);
      res.send({ imagePath: `/images/${result.key}` });
    } else {
      return res.status(401);
    }
  }
);

io.on("connection", (socket) => {
  let userEmailSocketScope = "";
  let userActiveRoomSocketScope = "";

  console.log("connection!");

  socket.on("userOnline", async ({ name, photoURL, email }) => {
    try {
      const result = await findOneItemByObject(UserModel, {
        email,
      });

      const user = {
        user: name,
        photoURL,
        email,
        accountStatus: `Hello! My name is ${decrypt(name)}!`,
      };

      if (!result) {
        await create(UserModel, user);
      }

      allSockets.push({ socket, ...user });

      userEmailSocketScope = email;

      socket.emit("userInfo");
    } catch (e) {
      logger.log(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("deleteRoom", async ({ user, email, room }) => {
    try {
      const userInArr = removeUserByEmail(email);

      socket.leave(room);

      if (user) {
        const userInDB = await findOneItemByObject(UserModel, {
          email,
        });

        let newRooms = [...userInDB.rooms];

        if (userInDB.rooms) {
          newRooms.splice(
            newRooms.findIndex((newRoomLooped) => newRoomLooped.room === room),
            1
          );
        }

        updateObjectByObject(
          UserModel,
          { email },
          {
            rooms: newRooms,
          }
        );

        const result = await findOneItemByObject(RoomModel, {
          room,
        });

        // Check if this is the last user in the room
        if (result.users.length <= 1) {
          // Delete the room
          await deleteByObject(RoomModel, {
            room,
          });

          // Delete all the messages related to the room
          await deleteManyByObject(MessageModel, { room });
        } else {
          io.to(room).emit("roomData", {
            users: getUsersInRoom(room),
          });

          const uid = uuidv4() + "-" + Date.now().toString();

          const formatted_date = getDate();

          await create(MessageModel, {
            user: encrypt("Admin"),
            room,
            photoURL: encrypt(
              "https://neverfinite.com/wp-content/uploads/2022/08/NeverFiniteChatroomIcon.png"
            ),
            email: encrypt("neverfinitetech@gmail.com"),
            createdAt: Date.now(),
            createdAtDisplay: formatted_date,
            text: encrypt(`${decrypt(user)} has left the room.`),
            media: "",
            mediaPath: "",
            imagePath: "",
            isEdited: false,
            uid,
          });

          socket.broadcast.to(userInArr.room).emit("message", {
            room,
            user: encrypt("Admin"),
            photoURL: encrypt(
              "https://neverfinite.com/wp-content/uploads/2022/08/NeverFiniteChatroomIcon.png"
            ),
            email: encrypt("neverfinitetech@gmail.com"),
            media: "",
            createdAtDisplay: formatted_date,
            mediaPath: "",
            isEdited: false,
            uid,
            createdAt: Date.now(),
            imagePath: "",
            text: encrypt(`${decrypt(user)} has left the room.`),
          });

          const roomResult = await findOneItemByObject(RoomModel, {
            room,
          });

          let newUsers = [...roomResult.users];

          if (roomResult.users) {
            newUsers.splice(
              newUsers.findIndex(
                (newUserLooped) => newUserLooped.email === email
              ),
              1
            );
          }

          updateObjectByObject(
            RoomModel,
            { room },
            {
              users: newUsers,
            }
          );
        }
      }
    } catch (e) {
      logger.log(e);
      console.log("Could not delete room!", e);
    }
  });

  socket.on("inviteUsers", ({ room, selectedUsersToInvite }) => {
    try {
      selectedUsersToInvite.forEach(async (email) => {
        let shouldInvite = true;

        const roomInDB = await findOneItemByObject(RoomModel, { room });

        if (roomInDB.invitedUsers && roomInDB.invitedUsers.includes(email))
          shouldInvite = false;

        if (shouldInvite) {
          const { invitedUsers } = await findOneItemByObject(RoomModel, {
            room,
          });
          const newInvitedUsers = invitedUsers
            ? [...invitedUsers, email]
            : [email];

          await updateObjectByObject(
            RoomModel,
            { room },
            { invitedUsers: newInvitedUsers }
          );

          const userInDB = await findOneItemByObject(UserModel, {
            email,
          });

          if (userInDB) {
            const newInvites = userInDB.invites
              ? [...userInDB.invites, room]
              : [room];

            await updateObjectByObject(
              UserModel,
              { email },
              { invites: newInvites }
            );

            const userSocketInArray = allSockets.find(
              (socketLooped) => socketLooped.email === email
            );

            if (userSocketInArray) {
              if (userSocketInArray.socket) {
                userSocketInArray.socket.emit("inviteToRoom");
              }
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
      const { invites } = await findOneItemByObject(UserModel, {
        email,
      });

      const newRoomInvites = [...invites];
      newRoomInvites.splice(invites.indexOf(room), 1);

      await updateObjectByObject(
        UserModel,
        { email },
        { invites: newRoomInvites }
      );
    } catch (e) {
      logger.log(e);
      console.log("Could not ignore room invite!", e);
    }
  });

  socket.on("declineRoomInvite", async ({ email, room }) => {
    try {
      const { invites } = await findOneItemByObject(UserModel, {
        email,
      });

      const newRoomInvites = [...invites];
      newRoomInvites.splice(invites.indexOf(room), 1);

      await updateObjectByObject(
        UserModel,
        { email },
        { invites: newRoomInvites }
      );

      const { invitedUsers } = await findOneItemByObject(RoomModel, {
        room,
      });

      const newInvitedUsers = [...invitedUsers];
      newInvitedUsers.splice(invitedUsers.indexOf(email), 1);

      await updateObjectByObject(
        RoomModel,
        { room },
        { invitedUsers: newInvitedUsers }
      );
    } catch (e) {
      logger.log(e);
      console.log("Could not ignore room invite!", e);
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

          let userInDB = await findOneItemByObject(UserModel, {
            email,
          });

          if (userInDB && userInDB.rooms) {
            if (userInDB.rooms.find((loopedRoom) => loopedRoom.room === room))
              shouldAddRoomToUser = false;
          }

          const rooms = await findMultipleItemsByObject(RoomModel, {});

          if (rooms.find((roomLooped) => roomLooped.room === room))
            shouldAddRoom = false;

          const roomInDB = await findOneItemByObject(RoomModel, {
            room,
          });

          if (roomInDB) {
            if (roomInDB.users.find((user) => user.email === email))
              shouldAddUserToRoom = false;
          }

          userInDB = await findOneItemByObject(UserModel, {
            email,
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
              UserModel,
              { email },
              { rooms: newRoomsInUser }
            );
          }

          if (shouldAddRoom) {
            await create(RoomModel, {
              room,
              isPrivate,
              users: [],
            });
          }

          if (shouldAddUserToRoom) {
            let newUsersInRoom = [];

            const roomInDBNew = await findOneItemByObject(RoomModel, {
              room,
            });

            userInDB = await findOneItemByObject(UserModel, {
              email,
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
              RoomModel,
              { room },
              { users: newUsersInRoom }
            );
          }

          // Invite the user to the room if they haven't already been invited
          let shouldInvite = true;

          const roomsInDB = await findMultipleItemsByObject(RoomModel, {});

          if (
            roomsInDB.find(
              (roomLooped) =>
                roomLooped.room === room &&
                roomLooped.invitedUsers &&
                roomLooped.invitedUsers.includes(email)
            )
          )
            shouldInvite = false;

          if (shouldInvite) {
            const { invitedUsers } = await findOneItemByObject(RoomModel, {
              room,
            });

            if (invitedUsers) {
              const newInvitedUsers = invitedUsers
                ? [...invitedUsers, email]
                : [email];

              await updateObjectByObject(
                RoomModel,
                { room },
                { invitedUsers: newInvitedUsers }
              );
            }
          }

          if (getUsersInRoom(room)) {
            const userToRemove = getUsersInRoom(room).find(
              (userInRoomLooped) => userInRoomLooped.email === email
            );
            if (userToRemove) {
              removeUserByEmail(userToRemove.email);
              socket.leave(room);
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

          socket.join(room);

          const uid = uuidv4() + "-" + Date.now().toString();

          const formatted_date = getDate();

          if (shouldAddRoomToUser) {
            socket.emit("message", {
              room,
              user: encrypt("Admin"),
              photoURL: encrypt(
                "https://neverfinite.com/wp-content/uploads/2022/08/NeverFiniteChatroomIcon.png"
              ),
              email: encrypt("neverfinitetech@gmail.com"),
              media: "",
              createdAtDisplay: formatted_date,
              mediaPath: "",
              isEdited: false,
              uid,
              createdAt: Date.now(),
              imagePath: "",
              text: encrypt("Welcome to the room!"),
            });

            await create(MessageModel, {
              user: encrypt("Admin"),
              room,
              photoURL: encrypt(
                "https://neverfinite.com/wp-content/uploads/2022/08/NeverFiniteChatroomIcon.png"
              ),
              email: encrypt("neverfinitetech@gmail.com"),
              createdAt: Date.now(),
              createdAtDisplay: formatted_date,
              text: encrypt(`${decrypt(user.user)} has joined the room`),
              media: "",
              mediaPath: "",
              imagePath: "",
              isEdited: false,
              uid,
            });

            socket.broadcast.to(user.room).emit("message", {
              room,
              user: encrypt("Admin"),
              photoURL: encrypt(
                "https://neverfinite.com/wp-content/uploads/2022/08/NeverFiniteChatroomIcon.png"
              ),
              email: encrypt("neverfinitetech@gmail.com"),
              media: "",
              createdAtDisplay: formatted_date,
              mediaPath: "",
              isEdited: false,
              uid,
              createdAt: Date.now(),
              imagePath: "",
              text: encrypt(`${decrypt(user.user)} has joined the room`),
            });
          }

          io.to(user.room).emit("roomData", {
            users: getUsersInRoom(room),
          });

          userInDB = await findOneItemByObject(UserModel, {
            email,
          });

          if (userInDB && userInDB.rooms) {
            const newRooms = [...userInDB.rooms];

            newRooms[
              newRooms.findIndex((newRoomLooped) => newRoomLooped.room === room)
            ].lastTimeOnline = lastTimeOnline;

            // Update the last time online in DB
            await updateObjectByObject(
              UserModel,
              {
                email,
              },
              { rooms: newRooms }
            );
          }

          userInDB = await findOneItemByObject(UserModel, {
            email,
          });

          if (userInDB) {
            const roomsToSendToClient = [...userInDB.rooms];

            socket.emit("rooms", {
              rooms: roomsToSendToClient,
            });
          }
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
      imagePath,
      uid,
      callback
    ) => {
      try {
        const createdAt = Date.now();

        await create(MessageModel, {
          user,
          room,
          photoURL,
          email,
          createdAt,
          createdAtDisplay,
          text: isMedia ? "" : message,
          media: isMedia ? message : "",
          mediaPath: mediaPath,
          imagePath: imagePath ? imagePath : "",
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
          imagePath: imagePath ? imagePath : "",
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
      throw new Error("Delete Message");

      const user = getUserByEmail(email);

      const messageInDB = await findOneItemByObject(MessageModel, {
        uid,
        email,
      });

      if (messageInDB && messageInDB.imagePath) {
        await deleteFile(messageInDB.imagePath.slice(8));
      }

      await deleteByObject(MessageModel, {
        uid,
      });

      if (user && user.room) {
        io.to(user.room).emit("delete", {
          uid,
        });
      }
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
          MessageModel,
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
      await updateObjectByObject(
        UserModel,
        {
          email,
        },
        { accountStatus }
      );

      const rooms = await findMultipleItemsByObject(RoomModel, {});

      rooms.forEach((room) => {
        if (room.users) {
          room.users.forEach(async (user) => {
            if (user.email === email) {
              const newUsers = [...room.users];

              newUsers[
                newUsers.findIndex(
                  (newUserLooped) => newUserLooped.email === email
                )
              ].accountStatus = accountStatus;

              await updateObjectByObject(
                RoomModel,
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
      console.log("Could not set new account status!", e);
    }
  });

  socket.on("startTypingMessage", async ({ room, email, user }) => {
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

  socket.on("stopTypingMessage", async ({ room, email }) => {
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
          const user = removeUserByEmail(userEmailSocketScope);

          if (user) {
            if (usersInRoomFiltered.length <= 1) {
              io.to(userActiveRoomSocketScope).emit("roomData", {
                users: getUsersInRoom(userActiveRoomSocketScope),
              });

              const userInDB = await findOneItemByObject(UserModel, {
                email: userEmailSocketScope,
              });

              if (userInDB) {
                const newRooms = [...userInDB.rooms];

                newRooms[
                  newRooms.findIndex(
                    (newRoomLooped) =>
                      newRoomLooped.room === userActiveRoomSocketScope
                  )
                ].lastTimeOnline = lastTimeOnlineInRoom;

                // Update the last time online in DB
                await updateObjectByObject(
                  UserModel,
                  {
                    email: userEmailSocketScope,
                  },
                  { rooms: newRooms }
                );
              }
            }
          }
        }

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
      const user = removeUserByEmail(email);

      socket.leave(userActiveRoomSocketScope);

      if (user) {
        if (usersInRoomFiltered.length <= 1) {
          io.to(user.room).emit("roomData", {
            users: getUsersInRoom(room),
          });

          const userInDB = await findOneItemByObject(UserModel, {
            email,
          });

          if (userInDB) {
            const newRooms = [...userInDB.rooms];

            if (
              lastTimeOnline &&
              newRooms[
                newRooms.findIndex(
                  (newRoomLooped) => newRoomLooped.room === room
                )
              ] &&
              newRooms[
                newRooms.findIndex(
                  (newRoomLooped) => newRoomLooped.room === room
                )
              ].lastTimeOnline
            ) {
              newRooms[
                newRooms.findIndex(
                  (newRoomLooped) => newRoomLooped.room === room
                )
              ].lastTimeOnline = lastTimeOnline;
            }

            // Update the last time online in DB
            await updateObjectByObject(
              UserModel,
              {
                email,
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

server.listen(PORT, () => {
  try {
    console.log(`Listening on port ${PORT}`);
  } catch (e) {
    console.error(e);
  }
});
