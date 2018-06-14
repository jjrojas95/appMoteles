const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const async = require("async");
const emailSenderCtrl = require('../controllers/emailSenderController');


const User = require('../models/user');


// index Register route
router.post('/register', (req,res) => {

  async.waterfall([
    emailSenderCtrl.generateToken(req),
    emailSenderCtrl.addTokenAndUser,
    emailSenderCtrl.sendEmail,
    function(email,done) {
      res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
      done(null,'done')
    }
  ], function(err) {
    if (err) {
      res.json({success: false, msg: `Failed generate token`});
      return next(err);
    }
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
router.get('/register/:token', (req, res) => {

  User.findOne({ emailAuthToken: req.params.token }, (err, user) => {

    if (!user) {
      return res.json({success: false, msg: `User doesn't exist`});
    }
    if ( new Date(user.emailAuthExpires) < Date.now() ) {
      async.waterfall([
        emailSenderCtrl.generateTokenWhenExpire(user,req),
        emailSenderCtrl.updatedTokenAndExpire,
        emailSenderCtrl.sendNewToken,
        function(email,done) {
          res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
          done(null,'done')
        }
      ], function(err) {
        if (err) {
          res.json({success: false, msg: `Failed generate token`});
          return next(err);
        }
      });
    } else {
      user.activate = true;
      User.findByIdAndUpdate(user._id, {activate: true}, (err, updateUser) => {
        return res.json({success: true, msg: `Activate Count`});
      });
    }

  });
});

//Profile route (probar authorization)
router.use('/profile', passport.authenticate('jwt', {session:false}) , (req,res) => {
  res.json({user: req.user});
});

module.exports = router;
