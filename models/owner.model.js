const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { customApiError } = require('../utils/ApiError');
const bcrypt = require('bcrypt');

const ownerSchema = new mongoose.Schema({
    username : {
        type : String,
        required : [true,"username is mandotory"],
        unique : true
    },
    fullname : {
        type : String,
        required : [true,"fullname is mandotory"]
    },
    email : {
        type : String,
        required : [true,"fullname is mandotory"],
        unique : true
    },
    contact : {
        type : Number,
        required : [true,"contact number is mandotory"],
        unique : true
    },
    password : {
        type : String,
        required : [true,"password is mandotory"]
    },
    address : {
        type : String,
        required : [true,"address is mandotory"]
    },
    gstin : {
        type : String,
        required : [true,"gst number is mandotory"]
    },
    picture : String,
    refreshToken :String,
    products : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product'
    }]
},{timestamps : true});

ownerSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

ownerSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

ownerSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.AccessKey,
        {
            expiresIn: process.env.AccessExpiry
        }
    )
}
ownerSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.RefreshKey,
        {
            expiresIn: process.env.RefreshExpiry
        }
    )
}
module.exports = mongoose.model("Owner",ownerSchema);
