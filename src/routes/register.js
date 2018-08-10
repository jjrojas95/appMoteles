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
    emailSenderCtrl.generateToken(req,req.query.host),
    emailSenderCtrl.addTokenAndUser,
    emailSenderCtrl.sendEmail,
    function(email,done) {
      done(null,email)
    }
  ], function(err,email) {
    if(err) {
      let unique = {};
      unique.username = err.errors.username? false : true;
      unique.email = err.errors.email? false : true;
      return res.json({success: false, msg: `Failed generate token`,unique: unique});
    }
    return res.json({success: true, msg: `An e-mail has been sent to ${email} with further instructions.`});
  });
});

// Update email auth activation
router.get('/:token', (req, res) => {

  User.findOne({ emailAuthToken: req.params.token }, (err, user) => {
    if (!user) return res.json({success: false, msg: `Algo falló, por favor intente de nuevo mas tarde o comuníquese con nosotros`});
    if (user.role !== 'currentUser') return res.json({success: false, msg: `Esta dirección URL no activa este tipo de cuentas`});
    if ( new Date(user.emailAuthExpires) < Date.now() ) {
      async.waterfall([
        emailSenderCtrl.generateTokenWhenExpire(user,req,req.query.host),
        emailSenderCtrl.updatedTokenAndExpire,
        emailSenderCtrl.sendNewToken,
        function(email,done) {
          done(null,email)
        }
      ], function(err,email) {
        if (err) return res.json({success: false, msg: `Esta dirección URL expriró, existe un fallo al generar una nueva, favor comuniquese con nosotros`});
        return res.json({success: true, msg: `Un email fue enviado a ${email} con instrucciones para activar su cuenta`});
      });
    } else {
      User.findByIdAndUpdate(user._id, {activate: true}, (err, updateUser) => {
        return res.json({success: true, msg: `Cuenta activada! Bienvenido`});
      });
    }

  });
});

module.exports = router;
