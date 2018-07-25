const authCtrl = {};


const User = require('../models/user');


module.exports = authCtrl;

module.exports.roleAuthorization = (roles) => {
    return (req, res, next) => {

        let user = req.user;

        User.findById(user._id, function(err, foundUser){

            if(err) return res.json({success: false, error: 'No user found.'});

            if(roles.indexOf(foundUser.role) > -1) return next();

            return res.json({success: false, error: 'You are not authorized to view this content'});

        });

    }

}
module.exports.roleAuthorizationComments = (roles,req,res,next) => {

        let user = req.user;
        User.findById(user._id, function(err, foundUser){

            if(err) return res.json({success: false, error: 'No user found.'});

            if(roles.indexOf(foundUser.role) > -1) return next();

            return res.json({success: false, error: 'You are not authorized to view this content'});

          });

}

module.exports.updatedUserPermission = (req,res,next) => {

        User.findById(req.params.user_id, function(err, foundUser){

            if(err) return res.json({success: false, error: 'Something was wrong'});

            if(req.user.role == 'moderator' && foundUser.role == 'currentUser') return next();

            if(req.user.role == 'admin') return next();

            return res.json({success: false, error: 'You are not authorized to view this content'});

          });

}
