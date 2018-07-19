const express = require('express');
const router = express.Router();
const passport = require('passport');



const opcPage = require('../config/opcPage');


//controllers
const fuzzySearch = require('../controllers/fuzzySearch');
const authCtrl = require('../controllers/authController');


const User = require('../models/user');


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
             query.activate = req.activate? true: false;
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

module.exports = router;
