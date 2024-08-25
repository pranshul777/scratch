const express = require("express");
const router = express.Router();
const user = require("../models/user.model.js");

// if(process.env.NODE_ENV=="development"){
//     router.route("/").post(async (req,res)=>{
//         if(user.find()){
//             res.json({
//                 "status":"unsuccessfull",
//                 "message":"there are users which exist"
//             })
//             return;
//         }
//         const userDetail = req.body;
         
//         const createdUser = await user.create(req.body);

//         res.status(201).json({
//             "status":"successfull",
//             "user" : createdUser
//         })
//     })
// }

router.route("/").get((req,res)=>{
    res.json({"status":"success","message":"you reached right place:User"});
})

module.exports = router;