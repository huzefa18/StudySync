const moongose= require("mongoose");
const connectDB= async()=>
    {
        
    const uri=process.env.MONGO_URI;
    if(!uri) throw new Error("MONOGO_uri is not defined in .env file");
    try{
        await moongose.connect(uri,{
            serverSelectionTimeoutMS: 10000,
            family: 4,
            connectTimeoutMS: 10000,
            tlsAllowInvalidCertificates: true,
        });
        console.log("connected to DB");
    }
    catch(err)
    {
        console.log("error connecting to DB",err);
        process.exit(1);
    }
}
module.exports=connectDB;