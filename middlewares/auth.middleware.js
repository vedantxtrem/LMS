import User from "../models/user.models.js";
import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    console.log('Received token:', token);

    if (!token) {
        return next(new AppError('Unauthorized, please login to continue', 401));
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new AppError('Unauthorized, please login to continue', 401));
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
