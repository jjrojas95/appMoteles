const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const uniqueValidator = require('mongoose-unique-validator');

const PlaceSchema = new mongoose.Schema({
    name: { type: String, required: true},
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    image: { type: String, require:true },
    page: { type: String, require:true },
    direction: { type: String, require:true },
    description: { type: String, required: true },
    roomStandard: {type: String, required: true},
    priceStandard: { type: Number, require: true },
    descriptionStandard: { type: String, required: true },
    author: {
       id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
       },
       username: String
    },
    comments: [
       {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment"
       }
    ]
});

PlaceSchema.plugin(uniqueValidator);

const Place = module.exports = mongoose.model("Place", PlaceSchema);

module.exports.addPlace = (newPlace,callback) => {
  Place.findOne({lat: newPlace.lat, lng: newPlace.lng}, (err,place) => {
    if(err) {
      throw err;
    }else{
    if (place){
      callback('already exist place',err)

    }else {

       newPlace.save(callback)

    }
    }
  })
};
