const AsyncWrapper = require('../utils/AsyncWrapper.js');
const {ApiError,customApiError} = require('../utils/ApiError.js');
const {badRequest,notAvailable,notFound,serviceUnavailable,unauthorised}= require('../utils/errors/error.js');
const product = require('../models/product.model.js');
const owner = require('../models/owner.model.js');
const fileUploader = require('../utils/cloudnary.js');

const getAllProducts = AsyncWrapper(async (req,res,next)=>{
    const productArray = await product.find();
    if(!productArray){
        return next(notFound());
    }
    res.status(200).json({"status":"success","data":productArray});
})

const getAllProductsOfCategory = AsyncWrapper(async (req,res,next)=>{
    const {category} = req.params;
    console.log(category);
    const products = await product.find({ category: category });
    res.status(200).json({"status":"success","data":products});
})
const createProduct = AsyncWrapper(async (req,res,next)=>{
    const {title,price,category}=req.body;
    if(!title || !price || !category){
        return next(badRequest());
    }
    console.log(title,price,category);
    const cloudinaryUrl = await fileUploader(req.file.path,next);
    if(!cloudinaryUrl){
        // console.log(cloudinaryUrl);
        return next(customApiError(500,"file URL can't be recieved"));
    }

    const createdProduct = await product.create({title,price,category,picture:cloudinaryUrl,owner:req.owner});
    if(!createdProduct){
        return next(customApiError(500,"product can't be created"));
    }
    console.log(createdProduct);
    const updatedOwner = await owner.findByIdAndUpdate(req.owner,{ $push: { products: createdProduct._id }});
    console.log(updatedOwner);
    res.status(201).json({"status":"success","data":createdProduct});
})
const updateProduct =AsyncWrapper(async (req,res,next)=>{
    const {id,title,description,price,category,discount,bgcolor,imagecolor}=req.body;
    const obj = new Object();
    if(!id){
        return next(badRequest());
    }
    if(title){
        obj.title = title;
    }
    if(description){
        obj.description = description;
    }
    if(category){
        obj.category = category;
    }
    if(discount){
        obj.discount = discount;
    }
    if(bgcolor){
        obj.bgcolor = bgcolor;
    }
    if(imagecolor){
        obj.imagecolor = imagecolor;
    }
    if(price){
        obj.price = price;
    }
    console.log(obj);
    const updatedProduct = await product.findByIdAndUpdate(id,obj);
    if(!updatedProduct){
        return next(customApiError(500,"product isn't updating"));
    }
    res.status(200).json({"status":"success","data":updatedProduct});
})
const deleteProduct = AsyncWrapper(async (req,res,next)=>{
    const {id}= req.body;
    if(!id){
        return next(badRequest());
    }
    console.log(id);
    await owner.findByIdAndUpdate(req.owner,{$pull : {products:id}})
    const deletedProduct = await product.findByIdAndDelete(id);
    res.status(200).json({"status":"success","message":"product deleted","data":deletedProduct})
})
module.exports={getAllProducts,getAllProductsOfCategory,createProduct,updateProduct,deleteProduct};