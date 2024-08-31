const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(503 ,"he server is currently unable to handle the request due to temporary");
}