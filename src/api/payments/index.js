import express from "express";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";
import PaymentModel from "./model.js";
import Stripe from "stripe";
const stripe = Stripe(
  "sk_test_51N2vqiE6c8bqw472TgjjLv4J4vpD4olATqZ6C2l5lAXorXFdAxQbADxxymumZMVXgtSrq7O4mgl3kGMcsTIlYOIR00mipaEZSa"
);
const paymentRouter = express.Router();

paymentRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  const { price, beneficiary, institution } = req.body;
  const payment = new PaymentModel({
    price,
    beneficiary,
    institution,
    donator: req.user._id,
  });
  await payment.save();

  res.send(payment);
});

paymentRouter.post("/payment-intent", async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.price * 100,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
  });
});

export default paymentRouter;
