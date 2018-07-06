const emailSenderRegisterAdminRouteCtrl = {};
var crypto = require("crypto");
var nodemailer = require("nodemailer");


const User = require('../models/user');

module.exports = emailSenderRegisterAdminRouteCtrl;

module.exports.generatePassAndToken = (req) => {
  return (done) => {
    crypto.randomBytes(20, function(err, buf) {
      let token = buf.toString('hex');
      let request = req.body;
      request.host = req.headers.host;
      request.token = token;
      crypto.randomBytes(4,(err,buf2) => {
        request.password = buf2.toString('hex').toString();
        console.log(buf2.toString('hex'));
        console.log(request.password);
        done(err,request);
      });
    });
  }
};

module.exports.addTokenAndUser = (request,done) => {
    let role = request.moderator? 'moderator':'adminPlace';
    let newUser = new User({
      name: request.name,
      email: request.email,
      username: request.username,
      password: request.password,
      emailAuthToken: request.token,
      emailAuthExpires: Date.now() + 3600000,
      role: role
    });

    User.addUser(newUser, (err, user) => {
      done(err,user,request);
    });
};

module.exports.sendEmail = (user,req,done) => {
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
        'http://' + req.host + '/register/admin/' + user.emailAuthToken + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
        'your pass is :' + req.password + '\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
      console.log('mail sent');
      done(err, user.email);
    });
};
