// este archivo contiene todas las rutas de registro que existen, moderador,
// admin super admin
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const async = require("async");
const emailSenderCtrl = require('../controllers/emailSenderController');


const User = require('../models/user');


// index Register route
router.post('/', (req,res) => {

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

// Update email auth activation
router.get('/:token', (req, res) => {

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
      User.findByIdAndUpdate(user._id, {activate: true}, (err, updateUser) => {
        return res.json({success: true, msg: `Activate Count`});
      });
    }

  });
});

module.exports = router;
