const cors = require("cors");

const corsOptions = {
  credentials: true,
  optionSuccessStatus: 200,
};

module.exports = function (app) {
  app.use(cors(corsOptions));
};
