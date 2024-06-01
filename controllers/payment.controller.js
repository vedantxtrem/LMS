import User from "../models/user.models.js";
import { Razorpay } from "../server.js";
import AppError from "../utils/error.util.js";
import Crypto from 'crypto';
import Payment from "../models/payment.models.js";

// Get Razorpay API key
const getRazorpayApikey = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'Razorpay API key',
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Buy subscription
const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorized, please login', 400));
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot purchase a subscription', 400));
        }

        const subscriptions = await Razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            total_count: 12,
        });

        user.subscription.id = subscriptions.id;
        user.subscription.status = subscriptions.status;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Subscribed Successfully',
            subscription_id: subscriptions.id,
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Verify subscription
const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

        const user = await User.findById(id);

        const subscriptionId = user.subscription.id;

        const generatedSignature = Crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment not verified, please try again.', 400));
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        });

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Cancel subscription
const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorized, please login', 400));
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot cancel a subscription', 400));
        }

        const subscriptionId = user.subscription.id;

        const subscription = await Razorpay.subscriptions.cancel(subscriptionId);

        user.subscription.status = subscription.status;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get all payments
const allPayments = async (req, res, next) => {
    try {
        const { count } = req.query;
        const subscriptions = await Razorpay.subscriptions.all({
            count: count || 10,
        });
        res.status(200).json({
            success: true,
            message: "All payments",
            subscriptions
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getRazorpayApikey,
    allPayments,
    cancelSubscription,
    buySubscription,
    verifySubscription
};