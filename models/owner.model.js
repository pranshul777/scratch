const mongoose = require('mongoose');

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

module.exports = mongoose.model("Owner",ownerSchema);
