const express = require('express');
const router = express.Router({mergeParams: true});
const async = require("async");
const passport = require('passport');


const emailSenderCtrl = require('../controllers/emailSenderController');


const Place = require('../models/place');
const User = require('../models/user');


const middlewareObj = require('../middleware');



// Index Places Route
router.get('', (req,res) => {
  Place.findById(req.params.id)
  .populate('comments')
  .exec((err,foundplace) => {
    if(err) return res.json({success:false,msg:`Something was wrong`});
    if(!foundplace) return res.json({success:false,msg:`This place doesn't exist`})
    return res.json({success:true,place:foundplace})
  });
});

// Edit particular places, Route
router.get('/edit',passport.authenticate('jwt', {session:false}),
          middlewareObj.checkPlaceOwnership,
          (req,res) => {
              Place.findById(req.params.id, (err,foundPlace) => {
                if(err) return res.json({success:false,msg:`Something was wrong`});
                return res.json({success:true,place:foundPlace})
              });
});

// Update Route
router.put('',passport.authenticate('jwt', {session:false}),
          middlewareObj.checkPlaceOwnership,
          (req,res) => {
              if(req.query.like || req.query.dislike) {
                let selectArray = req.query.like? 'like':'dislike';
                return Place.findById(req.params.id, (err,foundPlace) => {
                  if(err) return res.json({success:false,msg:`Something was wrong`});
                  foundPlace[selectArray].push(req.user._id);
                  let obj = {};
                  obj[selectArray] = foundPlace[selectArray];
                  obj.calification = foundPlace.like.length - foundPlace.dislike.length; 
                  Place.findByIdAndUpdate(req.params.id,obj,(er,updatedPlace) => {
                    if(err) return res.json({success:false,msg:`Something was wrong`});
                    if(req.query.like) return res.json({success:true,isLike:true});
                    return res.json({success:true,isLike:false});
                  });
                });
              }
              Place.findByIdAndUpdate(req.params.id,req.body.place,
                (err,updatedPlace) => {
                  if(err) return res.json({success:false,msg:`Something was wrong`});
                  Place.findById(req.params.id)
                  .populate('comments')
                  .exec((err,place) => {
                    if(err) return res.json({success:false,msg:`Something was wrong`});
                    return res.json({success:true,place:place});
                  });
              });
});

module.exports = router;
