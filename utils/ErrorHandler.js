const {ApiError,customApiError}=require('./ApiError.js');
// modules.exports=(err,req,res)=>{
//     if(!err){
//         next();
//     }
//     if(err instanceof ApiError){
//         return res.status(err.code).json({"status":"unsuccessful","message":err.msg});
//     }
//     res.status(500).json({"status":"umsuccessful","message":`unknown error :  ${err.message}`})
// }
module.exports = (err,req,res,next)=>{
    let status = err.scode || 500;
    res.status(status).json({"status" : "failed","message":err.message});
}