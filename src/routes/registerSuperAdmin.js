const express = require('express');
const router = express.Router();
const async = require("async");
const passport = require('passport');
const config = require('../config/database');


//controllers
const authCtrl = require('../controllers/authController');
const emailSenderRegisterAdminRouteCtrl = require('../controllers/emailSenderRegisterAdmin');
const emailSenderCtrl = require('../controllers/emailSenderController');



//models
const User = require('../models/user');


router.post('', (req,res) => {
              if(!req.body.email || !req.body.username || !req.body.name ||
                 !req.body.secret) {
                  return res.json({success: false, msg: `completed info required`});

              } else {
                if(req.body.secret == config.secret) {
                  async.waterfall([
                    emailSenderRegisterAdminRouteCtrl.generatePassAndToken(req),
                    emailSenderRegisterAdminRouteCtrl.addTokenAndAdminRole,
                    emailSenderRegisterAdminRouteCtrl.sendEmailAdmin,
                    (email,done) => {
                      done(null,email)
                    }
                  ], (err,email) => {
                      if(email) return res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
                      return res.json({success: false, msg: `Failed generate token`});
                  });
                } else {
                  return res.json({success:false, msg: `Not Secret`})
                }
              }
});

router.get('/:token', (req,res) => {
  User.findOne({ emailAuthToken: req.params.token }, (err, user) => {
      if (err) return res.json({success: false, msg:`Something was wrong`})
      if (!user) {
        return res.json({success: false, msg: `This token doesn't exist`});
      }
      if ( new Date(user.emailAuthExpires) < Date.now() ) {
        async.waterfall([
          emailSenderCtrl.generateTokenWhenExpire(user,req),
          emailSenderCtrl.updatedTokenAndExpire,
          emailSenderCtrl.sendNewTokenAdminRoute,
          function(email,done) {
            done(null,email)
          }
        ], (err,email) => {
          if (err) return res.json({success: false, msg: `Failed generate token`});
          return res.json({success: false, msg: `An e-mail has been sent to ${email} with further instructions.`});
        });
      }
      else {
        User.findByIdAndUpdate(user._id, {activate: true}, (err, updateUser) => {
          return res.json({success: true, msg: `Activate Count`});
        });
      }
  });
});


module.exports = router;
