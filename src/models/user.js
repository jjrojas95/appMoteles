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
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: [ 'currentUser', 'adminPlace', 'moderator','admin' ],
      default: 'currentUser'
    }
});


UserSchema.plugin(uniqueValidator);


const User = module.exports = mongoose.model("User", UserSchema);


module.exports.getUserById = (id,callback) => {
  User.findById(id,callback);
};


module.exports.getUserByUsername = (username,callback) => {
  let query = { username: username };
  User.find(query,callback);
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


module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null,isMatch);
  });
};
