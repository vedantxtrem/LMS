import { mongoose } from "mongoose";

//Mongoose.set('strictQuery',false);

const connectionToDB = async () =>{
    try{
        const {connection} = await mongoose.connect(
            process.env.MONGO_URI  || 'mongodb://localhost:27017/LMS' 
        )
        if(connection){
            console.log('connected to MONGODB');
        }
    }catch(e){
        console.log(e);
        process.exit(1);
    }
}

export default connectionToDB;