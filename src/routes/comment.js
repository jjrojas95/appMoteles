const express = require('express');
const router = express.Router({mergeParams: true});
const jwt = require('jsonwebtoken');
const passport = require('passport');


const middlewareObj = require('../middleware');



const Place = require('../models/place');
const Comment = require('../models/comment');


router.post("/",passport.authenticate('jwt', {session:false}),
            (req, res) => {
              //lookup campground using ID
              if(!req.body.comment) return res.json({success:false,msg:`you can't comment empty text`});
              Place.findById(req.params.id, (err, place) => {
                if(err) return res.json({success:false,msg:`Something was wrong`});
                if(!place) return res.json({success:false,msg:`Place doesn't exist`});
                Comment.create(req.body.comment, (err, comment) => {
                  if(err) return res.json({success:false,msg:`Something was wrong`});
                  //add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  place.comments.push(comment);
                  place.save();
                  return res.json({success:true,comment:comment});
                });
              });
});
// COMMENT UPDATE
router.put("/:comment_id", passport.authenticate('jwt', {session:false}),
          middlewareObj.checkCommentOwnership,
          (req, res) => {
            if(req.query.like || req.query.dislike) {
              let selectArray = req.query.like? 'like':'dislike';
              return Comment.findById(req.params.comment_id, (err,foundComment) => {
                if(err) return res.json({success:false,msg:`Something was wrong`});
                foundComment[selectArray].push(req.user._id);
                foundComment.calification = foundComment.like.length - foundComment.dislike.length;
                foundComment.save();
                if(req.query.like) return res.json({success:true,isLike:true});
                return res.json({success:true,isLike:false});
              });
            }
            Comment.findByIdAndUpdate(req.params.comment_id,
                                      req.body.comment,
                                      (err, updatedComment) => {
                if(err) return res.json({success:false,msg:`Something was wrong`});
                Comment.findById(req.params.comment_id,(err,updateComment) => {
                  if(err) return res.json({success:false,msg:`Something was wrong`});
                  return res.json({success:true,comment:updateComment});
                });
            });
});
// COMMENT DESTROY ROUTE
router.delete("/:comment_id",passport.authenticate('jwt', {session:false}),
              middlewareObj.checkCommentOwnership,
              function(req, res){
                //findByIdAndRemove
                Comment.findByIdAndRemove(req.params.comment_id, function(err){
                  if(err) return res.json({success:false,msg:`Something was wrong`});
                  Place.findById(req.params.id,(er,foundPlace) => {
                    if(er) return res.json({success:false,msg:`Something was wrong`});
                    if(!foundPlace.comments) return res.json({success:true,msg:`Deleted comment`});
                    if(foundPlace.comments.indexOf(req.params.comment_id) > -1) {
                      foundPlace.comments.splice(foundPlace.comments.indexOf(req.params.comment_id),1);
                      foundPlace.save();
                    }
                    return res.json({success:true,msg:`Deleted comment`});
                  });
                });
});

module.exports = router;
