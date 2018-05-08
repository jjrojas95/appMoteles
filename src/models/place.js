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
    description: { type: String, required: true },
    priceStandard: { type: Number, require: true },
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
//
// {
// 	"name": "Motel queso",
// 	"lat": "6.263923",
// 	"lng": "-75.589484",
// 	"image": "https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?auto=compress&cs=tinysrgb&h=350",
// 	"description": "queso queso queso",
// 	"priceStandard": "45000",
//  "page": "https://www.uber.com/a/join?ec_exp=1&exp=70801t&utm_source=AdWords_Brand&utm_campaign=search-google-brand_38_588_co-medellin_d_txt_acq_cpc_es-co_uber_kwd-169801042_95227495923_24783972963_e_c_track-jan20generalupdate_restructure&cid=393068043&adg_id=24783972963&fi_id=&match=e&net=g&dev=c&dev_m=&cre=95227495923&kwid=kwd-169801042&kw=uber&placement=&tar=&gclid=EAIaIQobChMIsuvftr7y2gIV0lqGCh21mQ9QEAAYASAAEgIgy_D_BwE&gclsrc=aw.ds&dclid=CIy1kLu-8toCFQH44QodzqEBkA&city=medellin",
// 	"author": {
// 		"id":"5af072bb0e803f38aa8dd9d9",
// 		"username": "queso"
// 	}
// }
