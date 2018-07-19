const express = require('express');
const router = express.Router();
const passport = require('passport');



const opcPage = require('../config/opcPage');


//controllers
const fuzzySearch = require('../controllers/fuzzySearch');
const authCtrl = require('../controllers/authController');


const User = require('../models/user');


router.get('', passport.authenticate('jwt', {session:false}),
          authCtrl.roleAuthorization(['admin']),
          (req,res) => {
            if (req.query.searchUsername) {
              let searchUsername = fuzzySearch.escapeRegex(req.query.searchUsername.toString());
              let page = req.query.page? Number(req.query.page) : 1;
              const regex = new RegExp(searchUsername, 'gi');
              return User.count({username: regex})
                     .exec((er,count) => {
                      if (er) return res.json({success: false, msg: `Something was wrong` });
                      if (!count) return res.json({success: true, users: null });
                      if (Math.ceil(count/opcPage.perPage) < page ) {
                        page = Math.ceil(count/opcPage.perPage);
                      }
                      return User.find({ username: regex })
                             .skip(opcPage.perPage*(page-1))
                             .limit(opcPage.perPage)
                             .exec ((err, foundUsers) => {
                                      if(err) return res.json({success: false, msg: `Something was wrong` });
                                      return res.json({success: true, users: foundUsers, page: page, count: count });
                                   });
                          });
            }
            if (req.query.searchEmail) {
              let searchEmail = fuzzySearch.escapeRegex(req.query.searchEmail.toString());
              let page = req.query.page? Number(req.query.page) : 1;
              const regex = new RegExp(searchEmail, 'gi');
              return User.count({ email: regex})
                     .exec((er,count) => {
                       if (er) return res.json({success: false, msg: `Something was wrong` });
                       if (!count) return res.json({success: true, users: null });
                       if (Math.ceil(count/opcPage.perPage) < page ) {
                         page = Math.ceil(count/opcPage.perPage);
                       }
                       return User.find({ email: regex })
                              .skip(opcPage.perPage*(page-1))
                              .limit(opcPage.perPage)
                              .exec((err, foundUsers) => {
                                      if(err) return res.json({success: false, msg: `Something was wrong` });
                                      return res.json({success: true, users: foundUsers, page: page, count: count});
                                    });
                          });
           }
});

module.exports = router;
