// After making changes, run these commands in cli
// $ git add .
// $ git commit -am "make it better"
// $ git push heroku master

const throng = require("throng");

const WORKERS = process.env.WEB_CONCURRENCY || 1;

throng(
  {
    workers: WORKERS,
    lifetime: Infinity,
  },
  start
);

function start() {
  const express = require("express");
  const socketio = require("socket.io");
  const http = require("http");
  const CryptoJS = require("crypto-js");
  const { v4: uuidv4 } = require("uuid");
  const cors = require("cors");

  const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

  const PORT = process.env.PORT || 5000;

  const router = require("./router");

  const app = express();
  const server = http.createServer(app);
  const io = socketio(server, {
    cors: {
      origin: "*",
    },
  });

  app.use(router);
  app.use(cors);

  const passphrase =
    "LIKDJFHSUDrhiuweyrsiu45y08w37ykjDbDKGLSDKfhliau45yiubjHsldKLJDSFh";

  const encrypt = (text) => {
    try {
      return CryptoJS.AES.encrypt(text, passphrase).toString();
    } catch (e) {
      console.log("Could not encrypt", e);
    }
  };

  const decrypt = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (e) {
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
    socket.on("join", ({ name, room, photoURL, email }, callback) => {
      try {
        for (let key in getUsersInRoom(room)) {
          if (getUsersInRoom(room)[key].name === name) {
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
        console.log(user.name, room);

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

        let uid = uuidv4();

        if (error) {
          console.log("An unexpected error occurred:", error);
          return callback(error);
        }

        socket.join(user.room);

        socket.emit("message", {
          user: "Admin",
          text: encrypt(`${user.name}, welcome to the ${user.room} chat room.`),
          photoURL:
            "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
          createdAtDisplay: formatted_date,
          uid: uid,
        });
        socket.broadcast.to(user.room.trim().toLowerCase()).emit("message", {
          user: "Admin",
          text: encrypt(`${user.name}, has joined!`),
          photoURL:
            "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
          createdAtDisplay: formatted_date,
          uid: uid,
        });

        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room),
        });

        callback();
      } catch (e) {
        console.log("Could not join", e);
      }
    });

    socket.on(
      "sendMessage",
      (message, createdAtDisplay, uid, mediaPath, isMedia, callback) => {
        try {
          const user = getUser(socket.id);
          console.log(uid);

          io.to(user.room).emit("message", {
            user: user.name,
            photoURL: user.photoURL,
            text: isMedia ? "" : message,
            media: isMedia ? message : "",
            mediaPath: mediaPath,
            createdAtDisplay: createdAtDisplay,
            uid: uid,
            isEdited: false,
          });

          callback();
        } catch (e) {
          console.log("Could not send message", e);
        }
      }
    );

    socket.on("deleteMessage", (uid) => {
      try {
        console.log("Message to delete:", uid);
        const user = getUser(socket.id);

        io.to(user.room).emit("delete", {
          uid: uid,
        });
      } catch (e) {
        console.log("Could not delete message", e);
      }
    });

    socket.on("editMessage", (uid, newMessage, newCreatedAtDisplay) => {
      try {
        console.log("Message to edit:", uid, newMessage, newCreatedAtDisplay);
        const user = getUser(socket.id);

        io.to(user.room).emit("edit", {
          uid: uid,
          newMessage: newMessage,
          newCreatedAtDisplay: newCreatedAtDisplay,
        });
      } catch (e) {
        console.log("Could not edit message", e);
      }
    });

    socket.on("disconnect", () => {
      try {
        console.log("User has left!!!");
        const user = removeUser(socket.id);

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

        let uid = uuidv4();

        if (user) {
          io.to(user.room).emit("message", {
            user: "Admin",
            text: encrypt(`${user.name} has left.`),
            photoURL:
              "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
            createdAtDisplay: formatted_date,
            uid: uid,
          });
          io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
          });
        }
      } catch (e) {
        console.log("Could not join", e);
      }
    });
  });

  server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
}
