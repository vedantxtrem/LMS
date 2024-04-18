import AppError from "../utils/error.util.js"

const getRazorpayApikey = async (req,res,next) => {
    try {
        
    } catch (error) {
        return next(new AppError(error.message,400) )
    }
}
const buySubscription = async (req,res,next) => {
    try {
        
    } catch (error) {
        return next(new AppError(error.message,400) )
    }
}
const verifySubscription = async (req,res,next) => {
    try {
        
    } catch (error) {
        return next(new AppError(error.message,400) )
    }
}
const cancelSubscription = async (req,res,next) => {
    try {
        
    } catch (error) {
        return next(new AppError(error.message,400) )
    }
}
const allPayments = async (req,res,next) => {
    try {
        
    } catch (error) {
        return next(new AppError(error.message,400) )
    }
}

export  {
    getRazorpayApikey,
    allPayments,
    cancelSubscription,
    buySubscription,
    verifySubscription
}