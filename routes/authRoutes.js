const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const createAndSendEmail = require("../mailer/nodemailer");
router.use(express.json());
const { messages } = require("../config/constants");

router.get("/", (req, res) => {
  res.send("Router works");
});

router.post("/api/signup", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(422).send({ error: messages.MISSING_FIELD });
  }
  if (password !== confirmPassword) {
    return res.status(422).send({ error: messages.PASSWORD_NOT_MATCHING });
  }

  try {
    let user = new User({ firstName, lastName, email, password });
    await user.save();
    let token = await user.generateAuthToken();
    user.toJSON();
    res.status(201).send({ user, token });
  } catch (error) {
    if (error.message.includes("duplicate key error")) {
      return res.status(422).send({ error: messages.DUPLICATE });
    }
    res.status(503).send({ error: error.message });
  }
});

router.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: messages.NO_EMAIL_FOUND });
  }
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(422).send({ error: messages.CANNOT_SIGNIN });
    }
    await user.comparePassword(password);
    let token = await user.generateAuthToken();
    user.toJSON();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(501).send({ error: messages.CANNOT_SIGNIN });
  }
});

router.post("/api/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (tokenObject) => tokenObject.token !== req.token
    );
    await req.user.save();
    res.status(200).send({ message: messages.LOGGED_OUT });
  } catch (error) {
    res.status(402).send({ error: error.message });
  }
});

router.post("/api/user/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send({});
  } catch (e) {
    res.status(402).send({ error: e.message });
  }
});

router.post("/api/user/recover", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: messages.USER_NOT_FOUND });
    }
    await user.generateResetToken();
    await user.save();

    let link = req.headers.host + "/reset/" + user.resetToken;
    const mailOpts = {
      to: user.email,
      subject: "Password reset link",
      text: `Hi ${user.firstName}
      Please click on the following link ${link} to reset your password.
      `,
    };
    let resp = await createAndSendEmail(mailOpts);
    res.status(200).send({ message: resp.response });
  } catch (error) {
    res.status(422).send({ error: error.message });
  }
});

router.get("/reset/:token", async (req, res) => {
  try {
    let user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).send({ error: messages.TOKEN_EXPIRED });
    }
    res.send({});
  } catch (error) {
    res.status(422).send({ error: error.message });
  }
});

router.post("/reset/:token", async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res.status(422).send({ error: messages.MISSING_FIELD });
  }
  if (password !== confirmPassword) {
    return res.status(402).send({ error: messages.PASSWORD_NOT_MATCHING });
  }
  try {
    let user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).send({ error: messages.USER_NOT_FOUND });
    }
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    const mailOpts = {
      to: user.email,
      subject: "Password has been changed",
      text: `Hi ${user.firstName}

      The password for your account ${user.email} has been changed.
      `,
    };

    let resp = await createAndSendEmail(mailOpts);
    res.status(200).send({ message: resp.response });
  } catch (error) {
    res.status(422).send({ error: error.message });
  }
});

module.exports = router;
