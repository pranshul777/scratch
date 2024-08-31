const express = require("express");
const app=express();
const router = express.Router();
const upload = require("../middlewares/multer.middleware.js");
const authO = require('../middlewares/authO.middleware.js');
const {getAllProducts, getAllProductsOfCategory, createProduct,updateProduct,deleteProduct} = require('../controllers/product.controller.js');


router.route("/products").get(getAllProducts);
router.route("/:category").get(getAllProductsOfCategory);
router.route("/create").post(authO,upload.single('image'),createProduct);
router.route("/updateProduct").patch(authO,updateProduct);
router.route("/deleteProduct").delete(authO,deleteProduct);


router.route("/").get((req,res)=>{
    res.json({"status":"success","message":"you reached right place:Product"});
})
module.exports = router;