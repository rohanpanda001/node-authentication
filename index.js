const express = require("express");
const mongoose = require("mongoose");
const bluebird = require("bluebird");

const app = express();
const port = 3000;
const url = "mongodb://localhost:27017/mydb";

mongoose.Promise = bluebird;
mongoose.connect(url, {
  autoReconnect: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
db = mongoose.connection;

db.on("connecting", () => console.log("Connecting to MongoDB."));

db.on("error", error => {
  console.error(`Error in MongoDB connection: ${error}`);
  mongoose.disconnect();
});

db.on("connected", () => {
  console.log("Connected to MongoDB!");
});

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log("App started."));
