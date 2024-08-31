const jwt = require('jsonwebtoken');
const { customApiError } = require('../utils/ApiError');
module.exports=async (req,res,next)=>{
    try {
        const token = req.headers.authorization || req.cookies.refreshToken;

        if (!token) {
            return next(customApiError(401,'Access token is missing or invalid'))
        }
        const decoded =jwt.verify(token.split(" ")[1], process.env.AccessKey);
        req.owner = decoded.id;
        console.log("authorised");
        next();
    } catch (error){
        if(error.name="TokenExpiredError"){
            try{
                const token = req.cookies.refreshToken;

                if (!token) {
                    return next(customApiError(401,'Refresh token is missing or invalid'))
                }
                const decoded =jwt.verify(token.split(" ")[1], process.env.RefreshKey);
                req.owner = decoded.id;
                console.log("authorised");
                next();
            }
            catch(err){
                return next(err);
            }
        }
        next(error);
    }
}