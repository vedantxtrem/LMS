import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'
const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    console.log("cookie wala :",token);
    // If no token send unauthorized message
    if (!token) {
      return next(new AppError("Unauthorized, please login to continue", 401));
    }
    
    // Decoding the token using jwt package verify method
    const decoded = await jwt.verify(token, process.env.JWT_SECERET);
  
    // If no decode send the message unauthorized
    if (!decoded) {
      return next(new AppError("Unauthorized, please login to continue", 401));
    }
  
    // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
    req.user = decoded;
  
    // Do not forget to call the next other wise the flow of execution will not be passed further
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