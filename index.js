const { MongoClient } = require("mongodb");
const express = require("express");
require("express-async-errors");
const socketio = require("socket.io");
const http = require("http");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: "https://a4dd9c4ee323453d9c42b34cb8d99e5a@o1101045.ingest.sentry.io/6134347",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const uri =
  "mongodb+srv://never-finite-chatroom-admin:4RjGzhTbbcepwPGe@never-finite-chatroom.mpem8.mongodb.net/chatroom?retryWrites=true&w=majority";

const client = new MongoClient(uri);

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = express.Router();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

require("./cors")(app);
app.use(router);

router.get("/", (req, res) => {
  res.send("The server is up and running! Waiting for connections...");
});

router.get("/users", async (req, res) => {
  try {
    const result = await findMultipleItemsByObject(
      client,
      "chatroom",
      "users",
      {}
    );

    res.send(result);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    const result = await findMultipleItemsByObject(
      client,
      "chatroom",
      "rooms",
      {}
    );

    res.send(result);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.get("/messages", async (req, res) => {
  try {
    const result = await findMultipleItemsByObject(
      client,
      "chatroom",
      "messages",
      {}
    );

    res.send(result);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

const passphrase =
  "LIKDJFHSUDrhiuweyrsiu45y08w37ykjDbDKGLSDKfhliau45yiubjHsldKLJDSFh";

const encrypt = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, passphrase).toString();
  } catch (e) {
    Sentry.captureException(e);
    console.log("Could not encrypt", e);
  }
};

const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (e) {
    Sentry.captureException(e);
    console.log("Could not decrypt", e);
  }
};

function appendLeadingZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n;
}

io.on("connection", (socket) => {
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
    } catch (e) {
      Sentry.captureException(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("deleteRoom", async ({ email, room }) => {
    try {
      console.log(`${email} has left the room '${room}'.`);

      const user = await findOneItemByObject(client, "chatroom", "users", {
        email,
      });

      let newRooms = [...user.rooms];

      if (user.rooms) {
        let index = "";
        for (let i = 0; i < user.rooms.length; i++) {
          if (
            user.rooms[i].room.toLowerCase().trim() ===
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
      Sentry.captureException(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("inviteUsers", ({ room, selectedUsersToInvite }) => {
    try {
      selectedUsersToInvite.forEach(async (user) => {
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
            roomLooped.invitedUsers.includes(user.email.toLowerCase().trim())
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
            ? [
                ...invitedUsers,
                user.email.toLowerCase().trim().toLowerCase().trim(),
              ]
            : [user.email.toLowerCase().trim().toLowerCase().trim()];

          await updateObjectByObject(
            client,
            "chatroom",
            "rooms",
            { room: room.toLowerCase().trim() },
            { invitedUsers: newInvitedUsers }
          );
        }
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on(
    "join",
    async ({ name, room, photoURL, email, newlyCreatedRoom, isPrivate }) => {
      try {
        let shouldAddRoomToUser = true;
        let shouldAddRoom = true;
        let shouldAddUserToRoom = true;

        const userInDB = await findOneItemByObject(
          client,
          "chatroom",
          "users",
          {
            email,
          }
        );

        if (userInDB.rooms) {
          userInDB.rooms.forEach((loopedRoom) => {
            if (
              loopedRoom.room.toLowerCase().trim() === room.toLowerCase().trim()
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

        if (shouldAddRoomToUser) {
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

        for (let key in getUsersInRoom(room)) {
          if (getUsersInRoom(room)[key].email === email) {
            removeUser(getUsersInRoom(room)[key].id);
          }
        }

        const { error, user } = addUser({
          id: socket.id,
          name,
          room,
          photoURL,
          email,
        });

        if (error) {
          console.log(
            "An unexpected error has occurred while adding the user to the room!",
            error
          );
          return callback(error);
        }

        console.log("User has joined!", user);

        let today = new Date();
        let shortMonths = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        let formatted_date =
          shortMonths[today.getMonth()] +
          " " +
          appendLeadingZeroes(today.getDate()) +
          ", " +
          today.getFullYear();

        const uid = uuidv4();

        socket.join(user.room);

        const createdAt = Date.now();

        if (newlyCreatedRoom) {
          socket.emit("message", {
            user: "Admin",
            text: encrypt(`${user.user} has created the room, "${user.room}"`),
            photoURL:
              "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
            createdAtDisplay: formatted_date,
            createdAt,
            uid: uid + createdAt,
          });
        }

        socket.broadcast.to(user.room).emit("message", {
          user: "Admin",
          text: encrypt(
            shouldAddRoomToUser
              ? `${user.user} has joined the chat room.`
              : `${user.user} is online.`
          ),
          photoURL:
            "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
          createdAtDisplay: formatted_date,
          uid: uid + createdAt,
          createdAt,
        });

        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
      } catch (e) {
        Sentry.captureException(e);
        console.log("Could not join the room!", e);
      }
    }
  );

  socket.on(
    "sendMessage",
    async (
      room,
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
        const user = getUser(socket.id);
        if (message && !isMedia) {
          console.log(decrypt(message));
        }

        const createdAt = Date.now();

        await create(client, "chatroom", "messages", {
          user: user.user,
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

        io.to(user.room).emit("message", {
          user: user.user,
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
        Sentry.captureException(e);
        console.log("Could not send message!", e);
      }
    }
  );

  socket.on("deleteMessage", async (uid) => {
    try {
      const user = getUser(socket.id);

      await deleteByObject(client, "chatroom", "messages", {
        uid,
      });

      io.to(user.room).emit("delete", {
        uid,
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log("Could not delete message!", e);
    }
  });

  socket.on("editMessage", async (uid, newMessage, newCreatedAtDisplay) => {
    try {
      const user = getUser(socket.id);

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
      Sentry.captureException(e);
      console.log("Could not edit message!", e);
    }
  });

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
      Sentry.captureException(e);
      console.log("Could not get online!", e);
    }
  });

  socket.on("typingMessage", ({ message }) => {
    try {
      const user = getUser(socket.id);

      if (message !== "")
        socket.broadcast.to(user.room).emit("typing", {
          user: user.user,
          text: `${user.user} is typing...`,
        });
      else {
        io.to(user.room).emit("stoppedTyping", {
          user: user.user,
        });
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log("Could not edit message!", e);
    }
  });

  socket.on("stoppedTypingMessage", () => {
    try {
      const user = getUser(socket.id);

      io.to(user.room).emit("stoppedTyping", {
        user: user.user,
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log("Could not edit message!", e);
    }
  });

  socket.on("disconnected", () => {
    try {
    } catch (e) {
      Sentry.captureException(e);
      console.log("Could not disconnect.", e);
    }
  });

  socket.on("leftRoom", (reason) => {
    try {
      const user = removeUser(socket.id);
      console.log(`${user.user} has gone offline. Reason: ${reason}`);

      let today = new Date();
      let shortMonths = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      let formatted_date =
        shortMonths[today.getMonth()] +
        " " +
        appendLeadingZeroes(today.getDate()) +
        ", " +
        today.getFullYear();

      const uid = uuidv4();

      if (user) {
        const createdAt = Date.now();

        io.to(user.room).emit("message", {
          user: "Admin",
          text: encrypt(`${user.user} has gone offline.`),
          photoURL:
            "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
          createdAtDisplay: formatted_date,
          uid: uid + createdAt,
          createdAt,
        });

        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
      }
    } catch (e) {
      Sentry.captureException(e);
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

async function findOneItemByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).findOne(object);

  if (result) {
    console.log(`Found an item in the collection with object: ${object}`);
    console.log(result);

    return result;
  } else {
    console.log(`No items found with the object '${object}'`);
  }
}

async function findMultipleItemsByObject(client, db, collection, object) {
  const cursor = await client.db(db).collection(collection).find(object);

  const results = await cursor.toArray();

  if (results) {
    console.log(`Found items in the collection with the object '${object}'`);
    console.log(`Results: ${results}`);

    return results;
  } else {
    console.log(`No items found with the object '${object}'`);
  }
}

async function create(client, db, collection, newObject) {
  const result = await client
    .db(db)
    .collection(collection)
    .insertOne(newObject);

  console.log(`New object created with the following id: ${result.insertedId}`);

  return result;
}

async function createMultiple(client, db, collection, newObjects) {
  const result = await client
    .db(db)
    .collection(collection)
    .insertMany(newObjects);

  console.log(
    `${result.insertedCount} new objects created with the following id(s):`
  );
  console.log(result.insertedIds);

  return result;
}

async function updateObjectByObject(
  client,
  db,
  collection,
  object,
  updatedObject
) {
  const result = await client
    .db(db)
    .collection(collection)
    .updateOne(object, { $set: updatedObject });

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} documents were updated`);

  return result;
}

async function updateManyObjectsByObject(
  client,
  db,
  collection,
  object,
  updatedObject
) {
  const result = await client
    .db(db)
    .collection(collection)
    .updateMany(object, { $set: updatedObject });

  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} documents were updated`);

  return result;
}

async function upsertObjectByObject(
  client,
  db,
  collection,
  object,
  updatedObject
) {
  const result = await client
    .db(db)
    .collection(collection)
    .updateOne(object, { $set: updatedObject }, { upsert: true });

  console.log(`${result.matchedCount} document(s) matched the query criteria`);

  if (result.upsertedCount > 0) {
    console.log(`One document was inserted with the id ${result.upsertedId}`);

    return result;
  } else {
    console.log(`${result.modifiedCount} document(s) were updated`);
  }
}

async function deleteByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).deleteOne(object);

  console.log(`${result.deletedCount} documents were deleted`);
  return result;
}

async function deleteManyByObject(client, db, collection, object) {
  const result = await client.db(db).collection(collection).deleteMany(object);

  console.log(`${result.deletedCount} documents were deleted`);

  return result;
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach((db) => {
    console.log(` - ${db.name}`);
  });
}
