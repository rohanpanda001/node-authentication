const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    // unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    // unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

//hashing a password before saving it to the database
UserSchema.pre("save", function(next) {
  const user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
