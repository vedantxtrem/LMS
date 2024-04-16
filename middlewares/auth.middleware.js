import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'

const isLoggedIn = async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new AppError('UnAuthenticeted ,please login ',401))
    }

    const userDetails = await jwt.verify(token,process.env.JWT_SECERET);

    req.user = userDetails;
    next();

}
const authorizedRoles = (...roles)=> async( req,res,next)=>{
    const currentUserRole = req.user.role;
    if(!roles.includes(currentUserRole)){
        return next(
            new AppError("you do not have permission to acces this route")
        )
    }
    next();
}
export {
    isLoggedIn,
    authorizedRoles
}