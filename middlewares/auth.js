const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { messages } = require("../config/constants");

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ error: messages.MUST_BE_LOGGED_IN });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
    if (error) {
      return res.status(401).send({ error: messages.MUST_BE_LOGGED_IN });
    }
    const { _id } = payload;
    const user = await User.findById(_id);
    req.user = user;
    req.token = token;
    next();
  });
};

module.exports = { auth };
