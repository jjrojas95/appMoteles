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
    if (err) return res.json({succes: false, msg: 'Something was wrong'});
    if (!user) return res.json({succes: false, msg: 'User not found'});
    User.comparePassword( password, user.password, (err,isMatch) => {
      if (err) throw err;
      if (isMatch && user.activate) {
        let token = jwt.sign({data: user},config.secret, {
          expiresIn: 86400 // 1 día
        });
        return res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            activate: user.activate,
            role: user.role
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


module.exports = router;
