import mongoose from "mongoose"



const MONGODB_URL= process.env.MONGO_DB_URL;
if(!MONGODB_URL){
    throw new Error("please define the mongoDb connection string in .env.local");   
}
let cached = globalThis.mongoose;
if(!cached){
    cached=globalThis.mongoose={conn :null,promise:null}
}
async function connectDB() {
    if (cached.conn){
        return cached.conn
    }
    if (!cached.promise){
        const opts={
            bufferCommands:false
        }
        cached.promise=mongoose.connect(MONGODB_URL,opts).then((mongooseInstance)=>{
            return mongooseInstance
        })
    }
    try{
        cached.conn=await cached.promise
    } catch(e){
        cached.promise=null
        throw e 
    }
    return cached.conn;
}
export default connectDB