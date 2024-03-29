import { mongoose, Schema , model  } from "mongoose";
import bcrypt from 'bcryptjs';
import  jwt  from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName :{
        type : String,
        required : [true,"Name is required"],
        minLength : [5 , "name must be at leat 5 character"],
        maxLength : [50, "name should be less than 50 character"],
        lowercase : true,
        trim :true
    },
    email : {
        type : String,
        required : [true,"Email is required"],
        unique : true,
        lowercase : true,
        trim : true,
    
    },
    password :{
        type : String,
        required : [true , "password is required"],
        minLength : [8,"password must be atleast 8 charachter's"],
        select : false
    },
    Avatar : {
        public_id : {
            type : String,

        },
        secure_url : {
            type : String,
        }
    },
    role : {
        type : String,
        enum : ['USER','ADMIN'],
        default : 'USER'
    },
    forgotPasswordToken : String,
    forgotPasswordTokenExpiry : Date,

},{
    timestamps : true
})

userSchema.pre('save', async function(){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password ,10);
});

userSchema.methods = {
    generateJWTToken : async function (){
        return await jwt.sign({
            id : this._id ,
            email : this.email,
            suscription : this.suscription,
            role : this.role,
            
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '24h'
        }
        

        )

    },
    comparePassword : async function(plainTextPassword) {
        return await bcrypt.compare(plainTextPassword,this.password);
    }
}


const User = mongoose.model("User",userSchema);

export default User;