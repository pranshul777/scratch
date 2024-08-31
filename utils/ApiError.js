class ApiError extends Error{
    constructor(code,msg){
        super(msg);
        this.scode = code;
    }
}
const customApiError = (code,msg)=>{
    return new ApiError(code,msg);
}


module.exports={ApiError,customApiError};