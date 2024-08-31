const express = require('express');
const cors = require('cors');
const path = require('path');
const process = require('process');
const cookieParser = require('cookie-parser');
const {connectDB}= require('./db/connect');
require('dotenv').config();
const userRoute = require('./routes/user.route.js');
const productRoute = require('./routes/product.route.js');
const ownerRoute = require('./routes/owner.route.js');
const ErrorHandler = require('./utils/ErrorHandler.js');

const app = express();
const port = process.env.PORT;


//pre-built or builtin middlewares
app.use(cors());
app.use(express.static(path.resolve(__dirname,"./public")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//middlewares


//routes
app.use("/api/v1/user",userRoute);
app.use("/api/v1/owner",ownerRoute);
app.use("/api/v1/product",productRoute);


// errorHandler : next(err)
app.use(ErrorHandler);

//remaining
app.get('*',(req,res)=>{
    res.status(404).json({"status" : "not successfull","message":"no service available for this endpoint"});
});



//database connect and listening
(
    async ()=>{
        try {
            await connectDB();
            app.listen(port,()=>{
                console.log(`Initial Setup completed, listening on port : ${port}`);
            })
        } catch (error) {
            console.log("Database is unable to connect : ",error);
            process.exit(1);
        }
    }
)();
// app.listen(port,()=>{
//     console.log(`Initial Setup completed, listening on port : ${port}`);
// })