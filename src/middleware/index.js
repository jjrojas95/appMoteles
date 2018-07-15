const mongoose = require('mongoose');
var Place = require("../models/place");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkPlaceOwnership = (req, res, next) => {
  if(req.query.like || req.query.dislike) {
    return Place.findById(req.params.id,(err,foundPlace) => {
      if(err) {return res.json({success:false, msg:`Something was wrong`});}
      if(!foundPlace) {return res.json({success:false, msg:`Place doesn't exist`});}
      let reviewLikeUsers = foundPlace.like.find((element) =>{
          if(element == req.user._id) return true
      });
      let reviewDislikeUsers = foundPlace.dislike.find((element) =>{
          if(element == req.user._id) return true
      });
      if(!reviewLikeUsers && !reviewDislikeUsers ) return next();
      return res.json({success:false, msg:`you can't rank two times`});
    });
  }
  Place.findById(req.params.id,(err, foundPlace) => {
    if(err) return res.json({success:false, msg:`Something was wrong`});
    if(foundPlace.author.id.equals(req.user._id)) {
      next();
    } else {
      return res.json({success:false, msg:`Place doesn't exist`});
    }
  });
}

// middlewareObj.checkCommentOwnership = function(req, res, next) {
//  if(req.isAuthenticated()){
//         Comment.findById(req.params.comment_id, function(err, foundComment){
//            if(err){
//                res.redirect("back");
//            }  else {
//                // does user own the comment?
//             if(foundComment.author.id.equals(req.user._id)) {
//                 next();
//             } else {
//                 req.flash("error", "You don't have permission to do that");
//                 res.redirect("back");
//             }
//            }
//         });
//     } else {
//         req.flash("error", "You need to be logged in to do that");
//         res.redirect("back");
//     }
// }

module.exports = middlewareObj;
