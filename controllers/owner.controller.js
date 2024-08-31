const AsyncWrapper = require('../utils/AsyncWrapper.js');
const {ApiError,customApiError} = require('../utils/ApiError.js');
const {badRequest,notAvailable,notFound,serviceUnavailable,unauthorised}= require('../utils/errors/error.js');
const owner = require('../models/owner.model.js');
const fileUploader = require('../utils/cloudnary.js');

const getOwnerData = AsyncWrapper(async (req,res,next)=>{
    const {username} = req.params;
    if(username == undefined || username ==null || username==""){
        return next(badRequest());
    }
    const foundUser = await owner.findOne({"username":username}).select("-password -address -cart -refreshToken -contact");
    if(foundUser == undefined || foundUser ==null || foundUser=={}){
        return next(notAvailable());
    }


    res.status(200).json({"status":"success","data":foundUser});
})


const registerOwner = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    const {username,password,email,fullname,contact,address,gstin} = req.body;
    if(username == undefined || username ==null || username=="" || password == undefined || password ==null || password=="" || email == undefined || email ==null || email=="" || fullname == undefined || fullname ==null || fullname=="" || contact == undefined || contact ==null || address == undefined || address ==null || address=="" || gstin == undefined || gstin ==null || gstin==""){
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
    if(!(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin))){
        return next(customApiError(403 ,"GstIn is not correct"));
    }
    
    //if user exists
    const existedUser = await owner.findOne({
        $or : [{email},{username},{contact},{gstin}]
    })
    if(existedUser){
        return next(customApiError(403,"Owner is already availale with these credentials"));
    }
    
    // create user
    const createdUser =await owner.create({username,password,email,fullname,contact,address,gstin});
    if(!createdUser){
        return next(customApiError(500,"not able to create a owner"));
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
    const foundUser = await owner.findById(createdUser._id).select("-password -refreshToken");
    if(!foundUser){
        return next(notAvailable());
    }

    // send response 
    res.status(201).json({"status":"success","data":foundUser,"token":accessToken});
})


const ownerLogin = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    const {username,password,email} = req.body;
    if(!username || !email){
        return next(customApiError(422,"please provide an email or an username"));
    }
 
    // check if user exists
    const existedUser = await owner.findOne({$or : [{username},{email}]})
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
    const resultUser = await owner.findOne(existedUser._id).select("-refreshToken -password");

    // sending api response
    res.status(200).json({"status":"success","data":resultUser,"token":accessToken});
})

const ownerLogout = AsyncWrapper(async (req,res,next)=>{

    const loggedUser = await owner.findById(req.owner);
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

const ownerUpdate = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    const {username,email,fullname,contact,address,gender,dateOfBirth,gstin} = req.body;

    const updateObject = new Object();    

    if(username){
        updateObject.username = username
    }
    if(gstin){
        updateObject.gstin = gstin
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
    const updatedUser = await owner.findByIdAndUpdate(req.owner,updateObject,{new:true}).select("-refreshToken -password -products");

    // sending api response
    res.status(200).json({"status":"success","data":updatedUser});
})

const uploadImage = AsyncWrapper(async (req,res,next)=>{
    console.log(req.file);
    const cloudinaryUrl = await fileUploader(req.file.path,next);
    if(!cloudinaryUrl){
        console.log(cloudinaryUrl);
        return next(customApiError(500,"file URL can't be recieved"));
    }
    console.log(cloudinaryUrl);
    const currentUser = await owner.findById(req.user);
    if(!currentUser){
        return next(customApiError(500,"owner can't be fetched for file upload"))
    }
    console.log(currentUser)
    currentUser.picture=cloudinaryUrl;
    currentUser.save({validateBeforeSave:false});
    res.status(200).json({"status":"success","message":"picture uploaded"});
})

const changePassword = AsyncWrapper(async (req,res,next)=>{
    const {password,newPassword}=req.body;
    if(!password || !newPassword){
        return next(notAvailable());
    }

    const currentUser = await owner.findById(req.owner);

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

const productsOfOwner = AsyncWrapper(async (req,res,next)=>{
    const currentUser = await owner.findById(req.owner);

    if(!currentUser){
        return next(notFound());
    }

    const cartProducts =  currentUser.products;

    if(!cartProducts){
        return next(notAvailable());
    }

    res.status(200).json({"status":"success","data":cartProducts});
})

module.exports={getOwnerData,registerOwner,ownerLogin,ownerUpdate,uploadImage,changePassword,productsOfOwner,ownerLogout};