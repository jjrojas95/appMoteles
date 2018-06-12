const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


const User = require('../models/user');


// index Register route
router.post('/register', (req,res) => {

  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        emailAuthToken: token,
        emailAuthExpires: Date.now() + 3600000;
      });
      User.addUser(newUser, (err, user) => {
        done(err,token,user);
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'jjrojas95a@gmail.com',
          pass: process.env.SENDER_PASS
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'jjrojas95a@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/register/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        res.json({success: true, msg: `An e-mail has been sent to ${user.email} with further instructions.`);
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.json({success: False, msg: `Failed generate token`);
  });
});


// Create Register route
router.post('/login', (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  User.getUserByUsername(username, (err,user) => {
    if (err) throw err;
    if (!user) {
      return res.json({succes: false, msg: 'User not found'});
    }
    User.comparePassword( password, user[0].password, (err,isMatch) => {
      if (err) throw err;
      if (isMatch && user[0].activate) {
        let token = jwt.sign({data: user[0]},config.secret, {
          expiresIn: 86400 // 1 día
        });
        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            name: user[0].name,
            username: user[0].username,
            email: user[0].email,
            activate: user[0].activate,
            role: user[0].role
          }
        });
      } else {
        return res.json({success: false, msg: 'Wrong Password'});
      }
    });
  });
});

// Update email auth activation
router.put('/register/:token', (req, res) => {

});

//Profile route (probar authorization)
router.use('/profile', passport.authenticate('jwt', {session:false}) , (req,res) => {
  res.json({user: req.user});
});

module.exports = router;
