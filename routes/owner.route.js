const express = require("express");
const app=express();
const router = express.Router();
const {getOwnerData,registerOwner,ownerLogin,ownerUpdate,uploadImage,changePassword,productsOfOwner,ownerLogout} = require('../controllers/owner.controller.js');
const upload = require("../middlewares/multer.middleware.js");
const authO = require('../middlewares/authO.middleware.js');

router.route("/").get((req,res)=>{
    res.json({"status":"success","message":"you reached right place:Owner"});
})

router.route("/uploadPicture").post(authO,upload.single('image'),uploadImage); // upload image on database
router.route("/login").get(ownerLogin); //for owner login
router.route("/logout").get(authO,ownerLogout); //user logout
router.route("/:username").get(getOwnerData); //to get basuc details of anyrandom user
router.route("/register").post(registerOwner); //for user registration
router.route("/updateUser").patch(authO,ownerUpdate); // to update user data
router.route("/changePassword").patch(authO,changePassword); // change password of user
router.route("/cart").get(authO,productsOfOwner); //to access cart of user

module.exports = router;