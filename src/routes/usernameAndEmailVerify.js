const express = require('express');
const router = express.Router();


const User = require('../models/user');


router.get('',(req,res)=>{
  if(req.query.email || req.query.username) {
    let query = req.query.email? {email: req.query.email} : {username: req.query.username};
    return User.count(query,(err,count)=>{
            if(err) return res.json({success:false});
            if(!count) return res.json({success:true})
            return res.json({success:false})
           });
  }
  return res.json({success:false})
})


module.exports = router;
