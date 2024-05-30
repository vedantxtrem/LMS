import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'
const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    // Check if token is present in cookies
    if (!token) {
        return next(new AppError('Unauthenticated, please login', 401));
    }

    try {
        // Verify the token using the secret key
        const decode = jwt.verify(token, process.env.JWT_SECERET);
        console.log(decode);
        req.user = decode;
        next();

    } catch (err) {
        // Handle token expiration and invalid token errors
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Token expired, please login again', 401));
        }
        return next(new AppError('Invalid token, please login again', 401));
    }
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