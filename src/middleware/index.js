const mongoose = require('mongoose');
const Place = require("../models/place");
const Comment = require("../models/comment");


//controllers
const authCtrl = require("../controllers/authController");


// all the middleare goes here
const middlewareObj = {};

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

middlewareObj.checkCommentOwnership = (req, res, next) => {
  if((req.query.like || req.query.dislike) && req.params.comment_id) {
    return Comment.findById(req.params.id,(err,foundComment) => {
      if(err) {return res.json({success:false, msg:`Something was wrong`});}
      if(!foundComment) {return res.json({success:false, msg:`Comment doesn't exist`});}
      let reviewLikeUsers = foundComment.like.find((element) =>{
          if(element == req.user._id) return true
      });
      let reviewDislikeUsers = foundComment.dislike.find((element) =>{
          if(element == req.user._id) return true
      });
      if(!reviewLikeUsers && !reviewDislikeUsers ) return next();
      return res.json({success:false, msg:`you can't rank two times`});
    });
  }
  if(req.user.role == 'moderator' || req.user.role == 'admin' ) return authCtrl.roleAuthorizationComments(['moderator','admin'],req,res,next);
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if(err) return res.json({success:false, msg:`Something was wrong`});
    // does user own the comment?
    if(foundComment.author.id.equals(req.user._id)) return next();
    return res.json({success:false, msg:`You don't have permission to do that`});
  });
}

module.exports = middlewareObj;
