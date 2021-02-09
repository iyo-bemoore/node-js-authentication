const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { PASSWORD } = require("../../config/constants");

const userShema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("You must provide a valid email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,

      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password must not include the word password");
        }
      },
    },
    resetToken: {
      type: String,
      required: false,
    },
    resetTokenExpiry: {
      type: Date,
      required: false,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timeStamps: true }
);

userShema.pre("save", function (next) {
  const user = this;
  if (!user.isModified(PASSWORD)) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userShema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userShema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  const { password, tokens, ...newUserObject } = userObject;
  return newUserObject;
};

userShema.methods.comparePassword = function (givenPass) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(givenPass, user.password, (err, isMatch) => {
      if (err) {
        reject(err);
      }
      if (!isMatch) {
        reject(false);
      }
      resolve(true);
    });
  });
};
userShema.methods.generateResetToken = function () {
  try {
    this.resetToken = crypto.randomBytes(20).toString("hex");
    this.resetTokenExpiry = Date.now() + 3600000;
  } catch (e) {
    console.log(e.message);
  }
};

mongoose.model("User", userShema);
