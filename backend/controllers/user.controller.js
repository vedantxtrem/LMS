import AppError from "../utility/error.utils.js";
import User from "../model/user.model.js";
import cloudinary from "cloudinary";
import fs from 'fs/promises';

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}

const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return next(new AppError('All fields are required ', 400));

        }

        const userExists = await UserActivation.findOne({ email });

        if (userExists) {
            return next(new AppError('Email already exists', 400));
        }

        const user = await User.create({
            fullName,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: "https://www.pexels.com/photo/black-google-smartphone-on-box-1482061/"
            }
        });
        if (!user) {
            return next(new AppError('user registration failed , please try again '))
        }

        // TODO : FILE UPLOAD


        if(req.file){

            console.log(req.file);
            try{
                const result = await cloudinary.v2.uploader.upload(req.file.path , {
                    folder:'LMS',
                    width:250,
                    height:250,
                    gravity:'faces',
                    crop: 'fill'

                });

                if(result){
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;


                    //remove file from local system
                    fs.rm(`uploads/${req.file.filename}`)
                }
            }catch(e){
                return next(
                    new AppError(error || "file not upload,please try again",500)
                )
            }
        }

        await user.save();
        user.password = undefined;

        const token = await user.generateJWTToken();

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success: true,
            message: "User resgisterd successfully",
            user,
        });

    } catch (e) {
        return next(AppError(e.message, 500));
    }


};
const login = async (req, res) => {

    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return next(new AppError('All fields are required ', 400));
        }

        const user = await User.findOne({
            email
        }).select('+password');

        if (!user || !user.comparePassword(password)) {
            return next(new AppError('email or password does not match', 400));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'user loggedin successfully',
            user,
        });
    }
    catch (e) {
        
        return next(AppError(e.message, 500));
    }

};

const logout = (req, res) => {
    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'user logged out successfully',
    });
};
const getProfile = async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        });
    }
    catch (e) {
        return next(new AppError('failed to fetch profile',500));
    }

};

export {
    signup,
    login,
    logout,
    getProfile,
}


