// contiene las rutas de perfil login y varios
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const passport = require('passport');
const async = require("async");
const emailSenderCtrl = require('../controllers/emailSenderController');


const User = require('../models/user');


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
        return res.json({
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

//Profile route (probar authorization)
router.use('/profile', passport.authenticate('jwt', {session:false}) , (req,res) => {
  res.json({user: req.user});
});

//route si las personas olvidan el password de las cuentas para resetearlo

router.post('/reset',(req,res) => {
  User.getUserByEmail(req.body.email, (err,user) => {
    if(err) {
      return res.json({success: false, msg: `Something was wrong`});
    }
    if (!user[0]) {
      return res.json({success: false, msg: `User doesn't exist`});
    } else {
      async.waterfall([
        emailSenderCtrl.generateTokenWhenExpire(user[0],req),
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

router.post('/reset/:token', (req, res) => {

  User.findOne({ passResetToken: req.params.token, passResetExpires: { $gt: Date.now() } },
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
    }
  });
});


module.exports = router;
