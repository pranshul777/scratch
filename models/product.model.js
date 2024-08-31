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
        default :0
    },
    category : [{
        type: String,
        enum : ["Footwear","Bottomwear","Formal","Casual","Upperwear","Male","Female","Kid","Adult","Undergarment"],
        required : [true,"category is mandotory"]
    }],
    picture :{
        type:String,
        required : [true,"picture is mandotory for a product"]
    },
    pictures :[String],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true,"owner is mandotory"]
    },
    discount : {
        type : Number,
        default : 0
    },
    bgcolor : {
        type : String,
        default : "gray",
        enum : ["gray","red","blue","pink","purple","white","yellow","green"]
    },
    imagecolor : {
        type : String,
        default : "gray",
        enum : ["gray","lightred","lightblue","lightpink","lightpurple","lightwhite","lightyellow","lightgreen"]
    }
},{timestamps : true});

module.exports = mongoose.model("Product",productSchema);
