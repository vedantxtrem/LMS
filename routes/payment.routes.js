import { Router } from "express";
import { allPayments, buySubscription, cancelSubscription, getRazorpayApikey, verifySubscription } from "../controllers/payment.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

paymentRouter.route('/razorpay-key')
                .get(isLoggedIn,getRazorpayApikey )


paymentRouter.route('/subscribe')
            .post(isLoggedIn,buySubscription)

paymentRouter.route('/verify')
            .post(isLoggedIn,verifySubscription)

paymentRouter.route('/unsubscribe').post(isLoggedIn,cancelSubscription)

paymentRouter.route('/').get(isLoggedIn,authorizedRoles('ADMIN'),allPayments)


export default paymentRouter;