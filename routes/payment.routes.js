import { Router } from "express";
import { allPayments, buySubscription, cancelSubscription, getRazorpayApikey, verifySubscription } from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.route('/razorpay-key')
                .get(getRazorpayApikey )


paymentRouter.route('/subscribe')
            .post(buySubscription)

paymentRouter.route('/verify')
            .post(verifySubscription)

paymentRouter.route('/unsubscribe').post(cancelSubscription)

paymentRouter.route('/').get(allPayments)


export default paymentRouter;