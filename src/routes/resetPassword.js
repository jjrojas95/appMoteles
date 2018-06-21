// contiene las rutas para resetear el Password
const express = require('express');
const router = express.Router();
const async = require("async");

//controllers
const emailSenderCtrl = require('../controllers/emailSenderController');


const User = require('../models/user');


router.post('',(req,res) => {
  User.getUserByEmail(req.body.email, (err,user) => {
    if(err) {
      return res.json({success: false, msg: `Something was wrong`});
    }
    if (!user) {
      return res.json({success: false, msg: `User doesn't exist`});
    } else {
      async.waterfall([
        emailSenderCtrl.generateTokenWhenExpire(user,req),
        emailSenderCtrl.updatedResetTokenAndExpire,
        emailSenderCtrl.sendResetToken,
        function(email,done) {
          res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
          done(null,'done')
        }], (err) => {
        if (err) {
          res.json({success: false, msg: `Failed generate token`});
          return next(err);
        }
      });
    }
  });

});

router.get('/:token', (req,res) => {
    User.findOne( {
      passResetToken: req.params.token,
      passResetExpires: { $gt: Date.now() }
    }, (err,user) => {
        if (err) {
          return res.json({success: false, msg: `Something was wrong`});
        }
        if(!user) {
          return res.json({success: false, msg: `Invalid token or token don't exist`});
        } else {
          return res.json({success: true, msg: `Valid token with reset password`});
        }

      });
});

// Updated Route
router.put('/:token', (req, res) => {

  User.findOne({
    passResetToken: req.params.token,
    passResetExpires: { $gt: Date.now() }
  },
   (err, user) => {
    if (err) {
      return res.json({success: false, msg: `Something was wrong`});
    }
    if (!user) {
      return res.json({success: false, msg: `User doesn't exist`});
    }
    if ( req.body.password === req.body.confirm ) {
      user.password = req.body.password;
      User.resetPassword(user, (err, updateUser) => {
        return res.json({success: true, msg: `Reset your password`});
      });
    } else {
      return res.json({success: false, msg: `Password don't match`})
    }
  });
});

module.exports = router;
