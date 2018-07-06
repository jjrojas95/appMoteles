const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const uniqueValidator = require('mongoose-unique-validator');


const UserSchema = new mongoose.Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    activate: { type: Boolean, default: false},
    emailAuthToken: String,
    emailAuthExpires: Date,
    passResetToken: String,
    passResetExpires: Date,
    role: {
      type: String,
      enum: [ 'currentUser', 'adminPlace', 'moderator','admin' ],
      default: 'currentUser'
    },
    place: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Place"
      },
      firstGenerate:  { type: Boolean, default: true }
    }
});


UserSchema.plugin(uniqueValidator);


const User = module.exports = mongoose.model("User", UserSchema);


module.exports.getUserById = (id,callback) => {
  User.findById(id,callback);
};

module.exports.getUserByUsername = (username,callback) => {
  let query = { username: username };
  User.findOne(query,callback);
};

module.exports.addUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getUserByEmail = (email,callback) => {
  let query = { email: email };
  User.findOne(query,callback);
};


module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null,isMatch);
  });
};

module.exports.resetPassword = (user, callback) => {
  bcrypt.genSalt( 10, (err,salt) => {
    bcrypt.hash(user.password,salt, (err, hash) => {
      if(err) throw err;
      User.findByIdAndUpdate(user._id, {password: hash}, callback);
    });
  });
};
