const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(401,"not provided valid credentials");
}