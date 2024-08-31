const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(404 ,"The server could not find the requested resource");
}