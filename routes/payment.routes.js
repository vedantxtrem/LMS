import { Router } from "express";

const paymentRouter = Router();

paymentRouter.route('/razorpay-key')
                .get(getRazorPaykey)