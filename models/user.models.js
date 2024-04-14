import {Schema,model} from 'mongoose'
import bcrypt from 'bcryptjs'
import  jwt  from 'jsonwebtoken';

const userSchema = new Schema({
    fullName : {
        type : 'String',
        required : [true,'Name is required'],
        maxLength : [30,'Name Should be less than 50 characters'],
        lowercase : true,
        trim : true
    },
    email : {
        type:'String',
        required : [true ,'Email is required'],
        lowercase: true,
        trim: true,
        unique: true
    },
    password : {
        type : 'String',
        required:[true,'password is required'],
        minLength:[8,'password must be at least 8 characters'],
        select : false,
    },
    avatar : {
        public_id :{
            type : 'String'
        },
        secure_url: {
            type : 'String'
        }
    },
    role :{
        type : 'String',
        enum: ["USER","ADMIN"],
        default: 'USER'
    },
    forgotPasswordToken : String,
    forgotPasswordExpiry : Date,


},{
    timestamps : true
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
})


const User = model('User',userSchema);

export default User;