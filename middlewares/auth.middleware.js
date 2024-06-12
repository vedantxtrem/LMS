import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    console.log("cookie wala :", token);
    
    // If no token, send unauthorized message
    if (!token) {
        return next(new AppError("Unauthorized, please login to continue", 401));
    }
    
    try {
        // Decoding the token using jwt package verify method
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      
        // If all good, store the decoded info in req object
        req.user = decoded;
      
        // Pass control to the next middleware
        next();
    } catch (error) {
        // If error occurs (e.g., token is invalid), send unauthorized message
        return next(new AppError("Unauthorized, please login to continue", 401));
    }
};

const authorizedRoles = (...roles) => (req, res, next) => {
    const currentUserRole = req.user.role;
    
    // Check if the current user's role is included in the allowed roles
    if (!roles.includes(currentUserRole)) {
        return next(
            new AppError("You do not have permission to access this route", 403)
        );
    }
    
    // Pass control to the next middleware
    next();
};

export {
    isLoggedIn,
    authorizedRoles
};
