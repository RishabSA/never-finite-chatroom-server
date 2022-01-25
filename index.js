const throng = require("throng");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
Sentry.init({
  dsn: "https://a4dd9c4ee323453d9c42b34cb8d99e5a@o1101045.ingest.sentry.io/6134347",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

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
    socket.on(
      "join",
      (
        { name, room, photoURL, email, firstTimeInRoom, newlyCreatedRoom },
        callback
      ) => {
        try {
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

          if (newlyCreatedRoom) {
            socket.emit("message", {
              user: "Admin",
              text: encrypt(
                `${user.user} has created the room, "${user.room}"`
              ),
              photoURL:
                "https://neverfinite.com/wp-content/uploads/2021/10/cropped-LogoOnly512x512png-4.png",
              createdAtDisplay: formatted_date,
              uid: uid,
            });
          }

          socket.broadcast.to(user.room).emit("message", {
            user: "Admin",
            text: encrypt(
              firstTimeInRoom
                ? `${user.user} has joined the chat room.`
                : `${user.user} is online.`
            ),
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
          Sentry.captureException(e);
          console.log("Could not join the room!", e);
        }
      }
    );

    socket.on(
      "sendMessage",
      (message, createdAtDisplay, uid, mediaPath, isMedia, callback) => {
        try {
          const user = getUser(socket.id);
          if (message && !isMedia) {
            console.log(decrypt(message));
          }

          io.to(user.room).emit("message", {
            user: user.user,
            photoURL: user.photoURL,
            text: isMedia ? "" : message,
            media: isMedia ? message : "",
            mediaPath: mediaPath,
            createdAtDisplay,
            uid,
            isEdited: false,
          });

          callback();
        } catch (e) {
          Sentry.captureException(e);
          console.log("Could not send message!", e);
        }
      }
    );

    socket.on("deleteMessage", (uid) => {
      try {
        const user = getUser(socket.id);

        io.to(user.room).emit("delete", {
          uid: uid,
        });
      } catch (e) {
        Sentry.captureException(e);
        console.log("Could not delete message!", e);
      }
    });

    socket.on("editMessage", (uid, newMessage, newCreatedAtDisplay) => {
      try {
        const user = getUser(socket.id);

        io.to(user.room).emit("edit", {
          uid: uid,
          newMessage: newMessage,
          newCreatedAtDisplay: newCreatedAtDisplay,
        });
      } catch (e) {
        Sentry.captureException(e);
        console.log("Could not edit message!", e);
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
    
    socket.on("disconnected", (reason) => {
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
          io.to(user.room).emit("message", {
            user: "Admin",
            text: encrypt(`${user.user} has gone offline.`),
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
        Sentry.captureException(e);
        console.log("Could not join!", e);
      }
    });
  });

  server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
}
