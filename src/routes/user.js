const express = require('express');
const router = express.Router();
const passport = require('passport');



const opcPage = require('../config/opcPage');


//controllers
const fuzzySearch = require('../controllers/fuzzySearch');
const authCtrl = require('../controllers/authController');


const User = require('../models/user');
const Place = require('../models/place');
const Comment = require('../models/comment');



router.get('', passport.authenticate('jwt', {session:false}),
          authCtrl.roleAuthorization(['admin','moderator']),
          (req,res) => {
            const query = {};
            let page = req.query.page? Number(req.query.page) : 1;
            if (req.user.role == 'moderator') {
              query.role = 'currentUser';
            }
            if (req.query.searchUsername) {
              let searchUsername = fuzzySearch.escapeRegex(req.query.searchUsername.toString());
              let regex = new RegExp(searchUsername, 'gi');
              query.username = regex;
            }
            if (req.query.searchEmail) {
              let searchEmail = fuzzySearch.escapeRegex(req.query.searchEmail.toString());
              let regex = new RegExp(searchEmail, 'gi');
              query.email = regex;
           }
           if (req.query.activate || req.query.inactive) {
             query.activate = req.query.activate? true: false;
           }
           if (!query.role && req.query.role) {
             query.role = req.query.role;
           }
           return User.count(query)
                  .exec((er,count) => {
                   if (er) return res.json({success: false, msg: `Something was wrong` });
                   if (!count) return res.json({success: true, users: null });
                   if (Math.ceil(count/opcPage.perPage) < page ) {
                     page = Math.ceil(count/opcPage.perPage);
                   }
                   return User.find(query)
                          .skip(opcPage.perPage*(page-1))
                          .limit(opcPage.perPage)
                          .exec ((err, foundUsers) => {
                                   if(err) return res.json({success: false, msg: `Something was wrong` });
                                   return res.json({success: true, users: foundUsers, page: page, count: count });
                                });
                       });
});


// Updated route
router.put('/:user_id',
            passport.authenticate('jwt', {session:false}),
            authCtrl.roleAuthorization(['admin','moderator']),
            authCtrl.updatedUserPermission,
            (req,res) => {
              if(req.query.activate || req.query.inactive){
              let activate = req.query.activate? true : false;
              return User.findByIdAndUpdate(req.params.user_id,
                                            {activate: activate},
                                            (err,updatedUser) => {
                                              if(err) return res.json({success: false, msg: `Something was wrong` });
                                              if(!user) return res.json({success: false, msg: `User doesn't found` });
                                              if(activate) return res.json({success: true, msg: `this account is activate` });
                                              return res.json({success: true, msg: `this account is inactive` });
                                              });
                          }
});

router.delete('/:user_id',
              passport.authenticate('jwt', {session:false}),
              authCtrl.roleAuthorization(['admin']),
              (req,res) => {
                let commentFindPromises = Comment.find({'author.id':req.params.user_id}).exec();
                return commentFindPromises
                       .then((comments) => {
                         if(!comments.legth) return User.findById(req.params.user_id);
                         comments.forEach((comment,index,commentsArray) => {
                           Place.findOneAndUpdate({comments: comment._id},
                                                  {$pull: { comments: comment._id}},
                                                  (error,foundPlace)=>{
                             if(error) return res.json({success: false, msg: `Something was wrong` });
                             comment.remove();
                           });
                         });
                         return User.findById(req.params.user_id)
                       })
                       .then((user)=>{
                         if(user.place.id){
                           Place.findById(user.place.id,(er,foundPlace)=>{
                             if(!foundPlace.comments) return foundPlace.remove();
                             foundPlace.comments.forEach((comment,index,commentsArray) => {
                               Comment.findByIdAndRemove(comment,(err,foundComment)=>{
                                 if(err) return res.json({success: false, msg: `Something was wrong...` });
                                 if (index == commentsArray.length - 1 ) return foundPlace.remove();
                               });
                             });
                           });
                         }
                       })
                       .then(()=>{
                         return User.findByIdAndRemove(req.params.user_id)
                       })
                       .then((user)=>{
                         if(!user) return res.json({success: false, msg: `Something was wrong..` });
                         return res.json({success:true});
                       })
                       .catch((err) => {return res.json({success: false, msg: `Something was wrong.` });});
});

module.exports = router;
