const express = require('express');
const router = express.Router();


const Place = require('../models/place');

// Index Places Routes
router.post('/', (req,res) => {
  let newPlace = new Place({
    name: req.body.name,
    lat: req.body.lat,
    lng: req.body.lng,
    image: req.body.image,
    description: req.body.description,
    priceStandard: req.body.priceStandard,
    page: req.body.page,
    author: {
       id: req.body.author.id,
       username: req.body.author.username
    },
  });
  Place.addPlace(newPlace, (err,place) => {
    if(err){
      console.log(err);
      res.json({success: false, msg: 'Failed register', error: err});
    }else {
      res.json({success: true, msg: 'registered'});
    }
  });
});

module.exports = router;
