const mongoose = require("mongoose");
require("dotenv").config();

const URI = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDb");
});
mongoose.connection.on("error", (e) => {
  console.error("Error connecting to MongoDb", e.message);
});
