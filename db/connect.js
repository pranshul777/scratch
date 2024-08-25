const mongoose = require('mongoose');
require('dotenv').config();
async function connectDB(){
    try {
        const connectionInstance =await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully at : ",connectionInstance.connection.host);
    } catch (error) {
        throw error;
    }
}
module.exports={connectDB};