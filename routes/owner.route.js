const express = require("express");
const router = express.Router();

router.route("/").get((req,res)=>{
    res.json({"status":"success","message":"you reached right place:Owner"});
})

module.exports = router;