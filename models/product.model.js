const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true,"title is mandotory"],
    },
    description : {
        type : String
    },
    price : {
        type : Number,
        required : [true,"price is mandotory"],
    },
    picture : String,
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    discount : {
        type : Number,
        default : 0
    },
    bgcolor : {
        type : String,
        enum : ["red","blue","pink","purple","white","yellow","green"]
    },
    imagecolor : {
        type : String,
        enum : ["lightred","lightblue","lightpink","lightpurple","lightwhite","lightyellow","lightgreen"]
    }
},{timestamps : true});

module.exports = mongoose.model("Product",productSchema);
