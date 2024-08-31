const v2 = require("cloudinary");
const fs = require('fs');
const { customApiError } = require("./ApiError");

v2.config({ 
    cloud_name: process.env.Cloud_Name, 
    api_key: process.env.API_key, 
    api_secret: process.env.API_Secret
});

const fileUploader = async (localFilePath,next)=>{
    try{
        console.log(localFilePath);
        if(!localFilePath) return next(customApiError(500,"no local file path"));

        const uploadResult = await v2.uploader.upload(localFilePath);
        // console.log(uploadResult);

        fs.unlinkSync(localFilePath);
        return uploadResult.url;
    }
    catch(err){
        fs.unlinkSync(localFilePath);
        next(customApiError(500,err.message));
    }
}


module.exports=fileUploader;