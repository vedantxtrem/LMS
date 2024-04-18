import User from "../models/user.models.js"
import { Razorpay } from "../server.js"
import AppError from "../utils/error.util.js"
import Crypto from 'crypto';
import Payment from "../models/payment.models.js";

const getRazorpayApikey = async (req,res,next) => {
    try {
        res.status(200).json({
            success : true,
            message : 'Razorpay API key',
            key: process.env.RZP
        })
        
    } catch (error) {
        return next(new AppError(error.message,500) )
    }
}
const buySubscription = async (req,res,next) => {
    try {

        const {id} = req.user;
        const user = await User.findById(id);

        if(!user){
            return next(
                new AppError('unauthorized,please login',400)
            )
        }
        if(user.role === 'ADMIN'){
            return next(
                new AppError('admin cannot purchase a subscription',400)
            )
        }
        const subscription = await Razorpay.subscription.create({
            plan_id : process.env.R_PLAN_ID,
            customer_notify : 1
        });

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Suscribed Successfully'
        })

    } catch (error) {
        return next(new AppError(error.message,500) )
    }
}
const verifySubscription = async (req,res,next) => {
    try {
        const {id} = req.user;
        const {razorpay_payment_id,razorpay_signature, razorpay_signature_id } = req.body;

        const user = await User.findById(id);
        if(!user){
            return next(
                new AppError('unauthorized,please login',400)
            )
        }
        const subscriptionId = user.subscription.id;

        
        const generatedSignature = Crypto
                        .createHmac('sha256',process.env.RZS)
                        .update(`${razorpay_payment_id} | ${subscriptionId}`)
                        .digest('hex');
                        if(generatedSignature !== razorpay_signature){
                            return next(
                                new AppError('payment not verified, please try agian ',500)
                            )
                        }
                        await Payment.create({
                            razorpay_payment_id,
                            razorpay_signature,
                            razorpay_subscription_id,
                        });

                        user.subscription.status = 'active';
                        await user.save();

                        res.status(200).json({
                            success: true,
                            message: 'payment verified succesfully'
                        })
        
    } catch (error) {
        return next(new AppError(error.message,500) )
    }
}
const cancelSubscription = async (req,res,next) => {
    try {
        const {id} = req.user;
        const user = await User.findById(id);

        if(!user){
            return next(
                new AppError('unauthorized,please login',400)
            )
        }
        if(user.role === 'ADMIN'){
            return next(
                new AppError('admin cannot purchase a subscription',400)
            )
        }
        const subscriptionId = user.subscription.id;

        const subscription  = await razorpay.subscription.cancel(
            subscriptionId
        )

        user.subscription.status = subscription.status;

        await user.save();
        
    } catch (error) {
        return next(new AppError(error.message,500) )
    }
}
const allPayments = async (req,res,next) => {
    try {
        const {count} = req.query;
        const subscriptions = await razorpay.subscription.all({
            count : count || 10,
        });
        res.status(200).json({
            success: true,
            message: "all payments",
            subscriptions
        })
    } catch (error) {
        return next(new AppError(error.message,500) )
    }
}

export  {
    getRazorpayApikey,
    allPayments,
    cancelSubscription,
    buySubscription,
    verifySubscription
}