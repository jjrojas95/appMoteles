const express = require('express');
const router = express.Router();
const async = require("async");


const emailSenderCtrl = require('../controllers/emailSenderController');
const fuzzySearch = require('../controllers/fuzzySearch');


const Place = require('../models/place');
const User = require('../models/user');


// Index Places Route
router.get('', (req,res) => {
  if (req.query.searchPlace) {
    const regex = new RegExp(escapeRegex(req.query.searchPlace), 'gi');
       Place.find({ "name": regex }, function(err, foundPlace) {
           if(err) return res.json({success: false, msg: `Something was wrong` });
           if(!foundPlace) return res.json({success: true, places: null });
           return res.json({success: true, places: foundPlace });
       });
  }
  if(req.query.lat1 && req.query.lat2 && req.query.lng1 && req.query.lng2) {
    return Place.find({
                  lat: { $gt: req.query.lat1, $lt: req.query.lat2 },
                  lng: { $gt: req.query.lng1, $lt: req.query.lng2 }
                }).populate('author.id','activate')
                .populate('comments').exec(
                  (err,places) => {
                  if(err) return res.json({success: false, msg: `Something was wrong` });
                  if(!places) return res.json({success: true, places: null});
                  let activatePlaces = [];
                  places.forEach((place) => {
                    if(Boolean(place.author.id.activate) == true) {
                      activatePlaces.push(place);
                    }
                  });
                  return res.json({success: true, places: activatePlaces});
                });
  }
});

// Create Places Routes
router.post('', (req,res) => {
  if(!req.query.token) return res.json({success: false, msg: `Something was wrong`});

  User.findOne({ emailAuthToken: req.query.token }, (err, user) => {
      if (err) return res.json({success: false, msg:`Something was wrong`})
      if (!user) return res.json({success: false, msg: `User doesn't exist`});
      if (!user.place.firstGenerate) return res.json({success: false, msg: `this token was used`});
      if ( new Date(user.emailAuthExpires) < Date.now() ) {
        async.waterfall([
          emailSenderCtrl.generateTokenWhenExpire(user,req),
          emailSenderCtrl.updatedTokenAndExpire,
          emailSenderCtrl.sendNewToken,
          function(email,done) {
            done(null,email)
          }
        ], function(err, email) {
          if (err) return res.json({success: false, msg: `Failed generate token`});
          return res.json({success: false, msg: `An e-mail has been sent to ${email} with further instructions.`});
        });
      }
      else {
        if(!req.body.name || !req.body.lat || !req.body.lng || !req.body.image ||
           !req.body.page || !req.body.description || !req.body.description ||
           !req.body.roomStandard || !req.body.descriptionStandard ||
           !req.body.priceStandard || !req.body.direction || !req.body.country ||
           !req.body.province || !req.body.city) {
             return res.json({success: false, msg: `complete require info`});
        }
        if (user.role == 'adminPlace') {
          Place.create(req.body, (err,newPlace) => {
            if(err) return res.json({success: false, msg: `Something was wrong`});
            newPlace.author.id = user._id;
            newPlace.author.username = user.username;
            newPlace.save();
            user.place.id = newPlace._id;
            user.place.firstGenerate = false;
            user.activate = true;
            user.save();
            return res.json({success: true, msg: `activate admin count`});
          });
        }
      }
  });
});


module.exports = router;
