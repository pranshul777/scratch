const express = require("express");
const app=express();
const router = express.Router();
const auth = require('../middlewares/auth.middleware.js');
const { getUserData,registerUser, userLogin, userUpdate, uploadImage, changePassword, cartOfUser, userLogout } = require("../controllers/user.controller.js");
const upload = require("../middlewares/multer.middleware.js");

router.route("/uploadPicture").post(auth,upload.single('image'),uploadImage); // upload image on database
router.route("/login").get(userLogin); //for user login
router.route("/logout").get(auth,userLogout); //user logout
router.route("/:username").get(getUserData); //to get basuc details of anyrandom user
router.route("/register").post(registerUser); //for user registration
router.route("/updateUser").patch(auth,userUpdate); // to update user data
router.route("/changePassword").patch(auth,changePassword); // change password of user
router.route("/cart").get(cartOfUser); //to access cart of user

module.exports = router;