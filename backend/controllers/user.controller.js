import AppError from "../utility/error.utils";


const signup = async (req,res)=>{
    const {fullName , email , password } = req.body;

    if(!fullName || !email || !password){
        return next (new AppError('All fields are required ',400));

    }

    const userExists = await UserActivation.findOne({ email });

    if (userExists){
        return next (new AppError('Email already exists',400));
    }
};
const login = (req,res)=>{

};
const logout = (req,res)=>{

};
const getProfile = (req,res)=>{

};

export{
    signup,
    login,
    logout,
    getProfile
}


