const mongoose = require('mongoose');

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
        required:[true,"gender of user is mandotory"],
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

module.exports = mongoose.model("User",userSchema);
