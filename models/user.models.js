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
        minLength:[6,'password must be at least 6 characters'],
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
    subscription: {
      id : String,
      status : String,
    }


},{
    timestamps : true
});

// Hashes password before saving to the database
userSchema.pre('save', async function (next) {
  // If password is not modified then do not hash it
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
  // method which will help us compare plain password with hashed password and returns true or false
  comparePassword: async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  },

  // Will generate a JWT token with user id as payload
  generateJWTToken: async function () {
    return await jwt.sign(
      { id: this._id, role: this.role, subscription: this.subscription },
      process.env.JWT_SECERET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },

  // This will generate a token for password reset
  generatePasswordResetToken: async function () {
    // creating a random token using node's built-in crypto module
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Again using crypto module to hash the generated resetToken with sha256 algorithm and storing it in database
    this.forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Adding forgot password expiry to 15 minutes
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

    return resetToken;
  },
};

const User = model('User',userSchema);

export default User;