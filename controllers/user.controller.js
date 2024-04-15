
import User from "../models/user.models.js";
import AppError from "../utils/error.util.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import crypto from 'crypto'

const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000,// 7days
    httpOnly: true,
    secure: true
}
const generateJWTToken = async()=>{
    return await jwt.sign(
        {id : User._id,email : User.email,subscription : User.subscription,role : User.role, },
        process.env.JWT_SECERET,
        {
            expiresIn : process.env.JWT_EXPIRY,
        }
    )
};

const comparePassword =  async (plainTextPassword)=>{
return await bcrypt.compare(plainTextPassword,this.password)
}

const generatePasswordResetToken = async()=>{
    const resetToken = crypto.randomBytes(20).toString('hex');
    User.forgotPasswordToken = crypto.createHash('sha256')
    .update(resetToken).digest('hex');
    User.forgotPasswordExpiry = Date.now()+15*60*1000; //15 min from now

    return resetToken;
}

const register = async (req, res, next) => {

    const { fullName, email, password  } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('All field are required', 400));
    }
    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('Email already exits', 400));
    }
    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg'
        }
    })
    if (!user) {
        return next(new AppError('user registration failed,try agin', 400));
    }
    //todo file upload;
   
    console.log('file details : ', req.file);
    if(req.file){
        
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder : "lms",
                width : 250,
                height : 250,
                gravity: 'faces',
                crop : 'fill'
            })
            if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (error) {
            return next(
                new AppError(error || 'File not upload try again',500)
            )
        }
    }

    await user.save();

    user.password = undefined;

    const token = await generateJWTToken();

    res.cookie('token', token, cookieOption)

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    })
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError('All field are required', 400));
        }

        const user = await User.findOne({
            email
        }).select('+password');
        if (!user || !comparePassword(password)) {
            return next(new AppError('Email or password not match', 400));
        }
        const token = await generateJWTToken();
        user.password = undefined;
        res.cookie('token', token, cookieOption);
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            user,
        })
    } catch (error) {
        return next(new AppError(error.message,500));
    }

}

const logout = (req, res) => {
    res.cookie('token',null,{
        secure : true,
        maxAge : 0,
        httpOnly: true
    })
    res.status(200).json({
        success:true,
        message:"user logged out successfully"
    })
}

const getProfile = async (req, res) => {
    try {
        const userID = req.user.id;
        const user = await User.findById(userID);

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        })
    } catch (error) {
        return next(new AppError('failed to fetch userdetail',500))
    }
}

const forgotPassword = async(req,res,next)=>{
    const {email} = req.body;
    if(!email){
        return next(new AppError('Email is required',400));
    }
    const user = await User.findOne({email});
    if(!user){
        return next(new AppError('Email not registered',400));
    }
    const resetToken = await generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    const message = `${resetPasswordURL}`
    try{
        await sendEmail(email,subject,message);
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email}`
        })
    }catch(e){
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next(new AppError(e.message,500))
    }

}
const resetPassword = (req,res,next)=>{
    
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
}