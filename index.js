const express = require("express");
const mongoose = require("mongoose");
const bluebird = require("bluebird");
const bodyParser = require("body-parser");
const User = require("./schemas/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

app.listen(port, () => console.log("App started."));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/create", (req, res) => {
  if (req.body.email && req.body.username && req.body.password) {
    const userData = {
      username: req.body.username,
      password: req.body.password
    };
    //use schema.create to insert data into the db
    User.create(userData, function(err, user) {
      if (err) {
        return res.send({ error: true, msg: err });
      } else {
        const token = jwt.sign(userData, "supersecret", {
          expiresIn: 120
        });
        return res.send({ success: true, token });
      }
    });
  }
});

app.post("/login", (req, res) => {
  const { body: { username, password } = {} } = req;
  if (username && password) {
    User.find({ username }, function(err, user) {
      if (err) {
        return res.send({ error: true, msg: err });
      } else {
        const [userDetails] = user;
        if (!userDetails) {
          return res.send({ success: false, msg: "Username not found" });
        }
        const { password: hash } = userDetails;
        return bcrypt
          .compare(password, hash)
          .then(isValid => {
            if (isValid) {
              const userData = { username, password };
              const token = jwt.sign(userData, "supersecret", {
                expiresIn: 120
              });
              return res.send({ success: true, token });
            } else {
              return res.send({ success: false, msg: "Invalid Credentials" });
            }
          })
          .catch(err => res.send({ error: true, msg: err }));
      }
    });
  }
});
