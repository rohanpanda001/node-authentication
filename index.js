/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./schemas/user');

const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017/mydb';

mongoose.Promise = bluebird;
mongoose.connect(url, {
  autoReconnect: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('connecting', () => console.log('Connecting to MongoDB.'));

db.on('error', (error) => {
  console.error(`Error in MongoDB connection: ${error}`);
  mongoose.disconnect();
});

db.on('connected', () => {
  console.log('Connected to MongoDB!');
});

app.listen(port, () => console.log('App started.'));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/create', (req, res) => {
  const { body: { email, name, password } = {} } = req;
  if (name && email && password) {
    bcrypt.hash(password, 10, (e, hash) => {
      const userData = {
        name,
        email,
        password: hash,
      };
      User.create(userData, (err) => {
        if (err) {
          return res.send({ error: true, msg: err.errmsg });
        }
        const token = jwt.sign(userData, 'supersecret', {
          expiresIn: 120,
        });
        return res.send({ success: true, token });
      });
    });
  }
});

app.post('/login', (req, res) => {
  const { body: { email, password } = {} } = req;
  if (email && password) {
    User.find({ email }, (err, user) => {
      if (err) {
        return res.send({ error: true, msg: err });
      }
      const [userDetails] = user;
      if (!userDetails) {
        return res.send({ success: false, msg: 'email not found' });
      }
      const { password: hash } = userDetails;
      return bcrypt
        .compare(password, hash)
        .then((isValid) => {
          if (isValid) {
            const userData = { email, password };
            const token = jwt.sign(userData, 'supersecret', {
              expiresIn: 120,
            });
            return res.send({ success: true, token });
          }
          return res.send({ success: false, msg: 'Invalid Credentials' });
        })
        .catch((error) => res.send({ error: true, msg: error }));
    });
  }
});
