const emailSenderCtrl = {};
var crypto = require("crypto");
var nodemailer = require("nodemailer");


const User = require('../models/user');

module.exports = emailSenderCtrl;

module.exports.generateToken = (req) => {
  return (done) => {
    crypto.randomBytes(20, function(err, buf) {
      var token = buf.toString('hex');
      var request = req.body;
      request.host = req.headers.host;
      request.token = token;
      done(err,request);
    });
  }
};

module.exports.addTokenAndUser = (request,done) => {
    let newUser = new User({
      name: request.name,
      email: request.email,
      username: request.username,
      password: request.password,
      emailAuthToken: request.token,
      emailAuthExpires: Date.now() + 3600000
    });

    User.addUser(newUser, (err, user) => {
      done(err,user,request.host);
    });
};

module.exports.sendEmail = (user,host,done) => {
  var smtpTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'jjrojas95a@gmail.com',
        pass: process.env.SENDER_PASS
      }
    });
  var mailOptions = {
      to: user.email,
      from: 'jjrojas95a@gmail.com',
      subject: 'Node.js Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + host + '/register/' + user.emailAuthToken + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
      console.log('mail sent');
      done(err, user.email);
    });
};

module.exports.generateTokenWhenExpire = (user,req) => {
  return (done) => {
    crypto.randomBytes(20, function(err, buf) {
      var token = buf.toString('hex');
      var host = req.headers.host;
      done(err,token,user,host);
    });
  }
};

module.exports.updatedTokenAndExpire = (token, user, host, done) => {

  user.emailAuthToken= token;
  user.emailAuthExpires= Date.now() + 3600000;

  User.findByIdAndUpdate(user._id, {
    emailAuthToken: token,
    emailAuthExpires: user.emailAuthExpires
  }, (err, updatedUser) => {
    done(err,token,updatedUser,host);
  });
};

module.exports.sendNewToken = (token, updatedUser, host, done) => {
  var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'jjrojas95a@gmail.com',
      pass: process.env.SENDER_PASS
    }
  });
  var mailOptions = {
    to: updatedUser.email,
    from: 'jjrojas95a@gmail.com',
    subject: 'Node.js Password Reset',
    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      'http://' + host + '/register/' + token + '\n\n' +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
  };
  smtpTransport.sendMail(mailOptions, function(err) {
    console.log('mail sent');
    done(err, updatedUser.email);
  });
}
