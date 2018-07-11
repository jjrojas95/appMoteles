// este archivo contiene todas las rutas de registro que existen, moderador,
// admin super admin
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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
      done(null,email)
    }
  ], function(err,email) {
    if (err) return res.json({success: false, msg: `Failed generate token`});
    return res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
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
          done(null,email)
        }
      ], function(err,email) {
        if (err) return res.json({success: false, msg: `Failed generate token`});
        return res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
      });
    } else {
      User.findByIdAndUpdate(user._id, {activate: true}, (err, updateUser) => {
        return res.json({success: true, msg: `Activate Count`});
      });
    }

  });
});

module.exports = router;
