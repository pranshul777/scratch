const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(400 ,"The server could not understand the request");
}