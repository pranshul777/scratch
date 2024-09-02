const AsyncWrapper = require('../utils/AsyncWrapper.js');
const {ApiError,customApiError} = require('../utils/ApiError.js');
const {badRequest,notAvailable,notFound,serviceUnavailable,unauthorised}= require('../utils/errors/error.js');
const user = require('../models/user.model.js');
const {fileUploader,deleteImage} = require('../utils/cloudnary.js');
const { default: mongoose } = require('mongoose');

const getUserData = AsyncWrapper(async (req,res,next)=>{
    const {username} = req.params;
    if(username == undefined || username ==null || username==""){
        return next(badRequest());
    }
    const foundUser = await user.findOne({"username":username}).select("-password -address -cart -refreshToken -contact");
    if(foundUser == undefined || foundUser ==null || foundUser=={}){
        return next(notAvailable());
    }


    res.status(200).json({"status":"success","data":foundUser});
})


const registerUser = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    const {username,password,email,fullname,contact,address} = req.body;
    if(username == undefined || username ==null || username=="" || password == undefined || password ==null || password=="" || email == undefined || email ==null || email=="" || fullname == undefined || fullname ==null || fullname=="" || contact == undefined || contact ==null || address == undefined || address ==null || address==""){
        return next(customApiError(422,"all creadtials are not available for registration of user"));
    }

    // regex
    if(!(/^[0-9A-Za-z]{6,16}$/.test(username))){
        return next(customApiError(403 ,"username is not correct"));
    }
    if(!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email))){
        return next(customApiError(403 ,"Email is not correct"));
    }
    if(!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/.test(password))){
        return next(customApiError(403 ,"Password is not correct"));
    }
    if(!(/^[0-9]{10}$/.test(contact))){
        return next(customApiError(403 ,"Contact is not correct"));
    }
    
    //if user exists
    const existedUser = await user.findOne({
        $or : [{email},{username},{contact}]
    })
    if(existedUser){
        return next(customApiError(403,"User is already availale with these credentials"));
    }
    
    // create user
    const createdUser =await user.create({username,password,email,fullname,contact,address});
    if(!createdUser){
        return next(customApiError(500,"not able to create a user"));
    }

    // generate tokens
    const accessToken =await createdUser.generateAccessToken();
    const refreshToken =await  createdUser.generateRefreshToken();
 
    // store access refresh token in the cookie
    res.cookie('accessToken', refreshToken, {
        httpOnly: true,
        secure: true, // Use secure flag in production
        sameSite: 'Strict', // Prevent CSRF
        maxAge: 24 * 60 * 60 * 1000 // 1 days
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // Use secure flag in production
        sameSite: 'Strict', // Prevent CSRF
        maxAge: 24 * 60 * 60 * 1000 // 1 days
    });



    // setting refreshtoken in user cookie
    createdUser.refreshToken=refreshToken;
    createdUser.save({validateBeforeSave:false});
    
    // get user without password and refresh token
    const foundUser = await user.findById(createdUser._id).select("-password -refreshToken");
    if(!foundUser){
        return next(notAvailable());
    }

    // send response 
    res.status(201).json({"status":"success","data":foundUser,"token":accessToken});
})


const userLogin = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    const {username,password,email} = req.body;
    if(!username || !email){
        return next(customApiError(422,"please provide an email or an username"));
    }
 
    // check if user exists
    const existedUser = await user.findOne({$or : [{username},{email}]})
    if(!existedUser){
        return next(notFound());
    }

    // check the password
    const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        return next(unauthorised());
    }


    // generating tokens
    const accessToken = await existedUser.generateAccessToken();
    const refreshToken =await  existedUser.generateRefreshToken();

    // store access refresh token in the cookie
    res.cookie('accessToken', refreshToken, {
        httpOnly: true,
        secure: true, // Use secure flag in production
        sameSite: 'Strict', // Prevent CSRF
        maxAge: 24 * 60 * 60 * 1000 // 1 days
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // Use secure flag in production
        sameSite: 'Strict', // Prevent CSRF
        maxAge: 24 * 60 * 60 * 1000 // 1 days
    });

    // setting refreshtoken in user cookie
    existedUser.refreshToken=refreshToken;
    existedUser.save({validateBeforeSave:false});

    // getting user without password and refreshtoken
    const resultUser = await user.findOne(existedUser._id).select("-refreshToken -password");

    // sending api response
    res.status(200).json({"status":"success","data":resultUser,"token":accessToken});
})

const userLogout = AsyncWrapper(async (req,res,next)=>{

    const loggedUser = await user.findById(req.user);
    if(!loggedUser){
        return next(notFound());
    }
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken');

    loggedUser.refreshToken=null;
    await loggedUser.save();
    // sending api response
    res.status(200).json({"status":"success","message":"logged out"});
})

const userUpdate = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    const {username,email,fullname,contact,address,gender,dateOfBirth} = req.body;

    const updateObject = new Object();    

    if(username){
        updateObject.username = username
    }
    if(email){
        updateObject.email = email
    }
    if(fullname){
        updateObject.fullname = fullname
    }
    if(contact){
        updateObject.contact = contact
    }
    if(gender){
        updateObject.gender = gender
    }
    if(address){
        updateObject.address = address
    }
    if(dateOfBirth){
        updateObject.dateOfBirth = dateOfBirth
    }
    console.log(updateObject);
    // update operation
    const updatedUser = await user.findByIdAndUpdate(req.user,updateObject,{new:true}).select("-refreshToken -password -cart");

    // sending api response
    res.status(200).json({"status":"success","data":updatedUser});
})

const uploadImage = AsyncWrapper(async (req,res,next)=>{
    //check if user already have an image
    const User = await user.findById(req.user);
    if(!User){
        return next(customApiError(500,"something is going wrong"));
    }
    const pic = User.picture;
    if(pic){
        await deleteImage(pic);
    }
    // console.log(req.file);
    const cloudinaryUrl = await fileUploader(req.file.path,next);
    if(!cloudinaryUrl){
        // console.log(cloudinaryUrl);
        return next(customApiError(500,"file URL can't be recieved"));
    }
    User.picture=cloudinaryUrl;
    await User.save();
    res.status(200).json({"status":"success","message":"picture uploaded"});
})

const changePassword = AsyncWrapper(async (req,res,next)=>{
    const {password,newPassword}=req.body;
    if(!password || !newPassword){
        return next(notAvailable());
    }

    const currentUser = await user.findById(req.user);

    if(!currentUser){
        return next(notFound());
    }

    const isPasswordCorrect = await currentUser.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        return next(unauthorised());
    }

    currentUser.password = newPassword;
    await currentUser.save();

    res.status(200).json({"status":"success","data":currentUser});
})

const cartOfUser = AsyncWrapper(async (req,res,next)=>{
    const currentUser = await user.findById(req.user);

    if(!currentUser){
        return next(notFound());
    }

    const cartProducts =  currentUser.cart;

    if(!cartProducts){
        return next(notAvailable());
    }

    res.status(200).json({"status":"success","data":cartProducts});
})

const addToCart= AsyncWrapper(async (req,res,next)=>{
    const {product} = req.user;
    if(!product || typeof product != mongoose.Schema.Types.ObjectId){
        return next(customApiError(500,"not provided valid product id"))
    }
    const User =await user.findByIdAndUpdate(req.user,{$push : {cart : product}});
    if(!User){
        return next(customApiError(500,"User is not available"));
    }
    res.status(200).json({"status":"successful"})
})
const removeFromCart = AsyncWrapper(async (req,res,next)=>{
    const {product} = req.user;
    if(!product || typeof product != mongoose.Schema.Types.ObjectId){
        return next(customApiError(500,"not provided valid product id"))
    }
    const User =await user.findByIdAndUpdate(req.user,{$pull : {cart : product}});
    if(!User){
        return next(customApiError(500,"User is not available"));
    }
    res.status(200).json({"status":"successful"})
})
module.exports={getUserData,registerUser,userLogin,userUpdate,uploadImage,changePassword,cartOfUser,userLogout,addToCart,removeFromCart};