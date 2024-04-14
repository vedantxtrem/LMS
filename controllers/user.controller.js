
import User from "../models/user.models.js";
import AppError from "../utils/error.util.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

const register = async (req, res, next) => {

    const { fullName, email, password } = req.body;

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
        return next(new AppError('failed to fetch userdetail',400))
    }
}

export {
    register,
    login,
    logout,
    getProfile,
}