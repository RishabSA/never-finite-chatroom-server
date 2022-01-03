const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("The server is up and running! Waiting for connections...");
});

module.exports = router;