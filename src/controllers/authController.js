const authCtrl = {};


const User = require('../models/user');


module.exports = authCtrl;

module.exports.roleAuthorization = (roles) => {
    return (req, res, next) => {

        let user = req.user;

        User.findById(user._id, function(err, foundUser){

            if(err){
                res.json({success: false, error: 'No user found.'});
                return next(err);
            }

            if(roles.indexOf(foundUser.role) > -1){
                return next();
            }

            res.json({success: false, error: 'You are not authorized to view this content'});
            return next('Unauthorized');

        });

    }

}
module.exports.roleAuthorizationComments = (roles,req,res,next) => {

        let user = req.user;
        User.findById(user._id, function(err, foundUser){

            if(err){
                res.json({success: false, error: 'No user found.'});
                return next(err);
            }

            if(roles.indexOf(foundUser.role) > -1){
                return next();
            }

            res.json({success: false, error: 'You are not authorized to view this content'});
            return next('Unauthorized');

          });

}
