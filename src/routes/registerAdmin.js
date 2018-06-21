const express = require('express');
const router = express.Router();
const async = require("async");
const passport = require('passport');


//controllers
const authCtrl = require('../controllers/authController');
const emailSenderRegisterAdminRouteCtrl = require('../controllers/emailSenderRegisterAdmin');



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

module.exports = router;
