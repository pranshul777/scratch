const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { customApiError } = require('../utils/ApiError');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
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
    picture : String,
    gender:{
        type:String,
        enum :["Man","Woman","Other"]
    },
    dateOfBirth:{
        type: Date,
    },
    refreshToken :String,
    cart : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product'
    }]
},{timestamps : true});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function (){
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
userSchema.methods.generateRefreshToken = function (){
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
module.exports = mongoose.model("User",userSchema);