const express = require('express');
const router = express.Router();
const async = require("async");
const passport = require('passport');


//controllers
const authCtrl = require('../controllers/authController');
const emailSenderRegisterAdminRouteCtrl = require('../controllers/emailSenderRegisterAdmin');
const emailSenderCtrl = require('../controllers/emailSenderController');



//models
const User = require('../models/user');


router.post('',passport.authenticate('jwt', {session:false}),
            authCtrl.roleAuthorization(['currentUser']), (req,res) => {
              if(!req.body.email || !req.body.username || !req.body.name ||
                (!req.body.adminPlace && !req.body.moderator)) {
                  return res.json({success: false, msg: `completed info required`});

              } else {
                if(req.body.adminPlace || req.body.moderator) {
                  async.waterfall([
                    emailSenderRegisterAdminRouteCtrl.generatePassAndToken(req),
                    emailSenderRegisterAdminRouteCtrl.addTokenAndUser,
                    emailSenderRegisterAdminRouteCtrl.sendEmail,
                    (email,done) => {
                      res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
                      done(null,'done')
                    }
                  ], (err) => {
                    if (err) {
                      res.json({success: false, msg: `Failed generate token`});
                      return next(err);
                    }
                  });
                }
              }
});

router.get('/:token', (req,res) => {
  User.findOne({ emailAuthToken: req.params.token }, (err, user) => {
      if (err) return res.json({success: false, msg:`Something was wrong`})
      if (!user) {
        return res.json({success: false, msg: `User doesn't exist`});
      }
      if ( new Date(user.emailAuthExpires) < Date.now() ) {
        async.waterfall([
          emailSenderCtrl.generateTokenWhenExpire(user,req),
          emailSenderCtrl.updatedTokenAndExpire,
          emailSenderCtrl.sendNewToken,
          function(email,done) {
            res.json({success: false, msg: `An e-mail has been sent to ${email} with further instructions.`});
            done(null,'done')
          }
        ], function(err) {
          if (err) {
            res.json({success: false, msg: `Failed generate token`});
            return next(err);
          }
        });
      }
      else {
        if (user.role === 'adminPlace') {
          if(!user.place.firstGenerate) {
            return res.json({success: false, msg: `you will use this token, edit in your profile`});
          }
          return res.json({success: true, msg: `validate Token`});
        }
        User.findByIdAndUpdate(user._id, {activate: true}, (err, updateUser) => {
          return res.json({success: true, msg: `Activate Count`});
        });
      }
  });
});


module.exports = router;
