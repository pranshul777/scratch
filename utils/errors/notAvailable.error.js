const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(203,"The request was successful, but there is no content to available");
}