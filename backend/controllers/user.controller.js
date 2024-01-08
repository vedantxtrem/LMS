import AppError from "../utility/error.utils.js";
import User  from "../model/user.model.js";

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

        if (!userExists) {

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
        return  next(AppError(e.message,500));
    }


};
const login = async (req, res) => {

    const { email, password } = req.body;

    try{
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
            message : 'user loggedin successfully',
            user,
        });
    }
    catch(e){
        return next(AppError(e.message,500));
    }
    
};

const logout = (req, res) => {

};
const getProfile = (req, res) => {

};

export {
    signup,
    login,
    logout,
    getProfile
}


