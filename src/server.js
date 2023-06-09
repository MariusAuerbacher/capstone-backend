/*import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});*/

import { join } from "path";
import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
  validationHandler,
} from "./errorHandlers.js";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import userRouter from "./api/users/index.js";
import institutionRouter from "./api/institutions/index.js";
import beneficiariesRouter from "./api/beneficiaries/index.js";
import { JWTAuthMiddleware } from "./lib/auth/jwt.js";
import userModel from "./api/users/model.js";
import institutionModel from "./api/institutions/model.js";
import { admin } from "./lib/auth/admin.js";
import Stripe from "stripe";
import paymentRouter from "./api/payments/index.js";
import googleStrategy from "./lib/auth/googleOauth.js";
import passport from "passport";

const stripe = Stripe(process.env.STRIPE_KEY);

const server = Express();
const port = process.env.PORT || 3001;

const publicFolderPath = join(process.cwd(), "./public");
server.use(Express.static(publicFolderPath));
passport.use("google", googleStrategy);
// **************************************** MIDDLEWARES *****************************************
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Origin ${currentOrigin} is not in the whitelist!`
          )
        );
      }
    },
  })
);
server.use(Express.json());
server.use(passport.initialize());
// ****************************************** ENDPOINTS *****************************************
server.use("/institutions", institutionRouter);
server.use("/users", userRouter);
server.use("/beneficiaries", beneficiariesRouter);
server.use("/payments", paymentRouter);
server.get("/profile", JWTAuthMiddleware, async (req, res, next) => {
  if (req.user.role === "DONATOR") {
    const donator = await userModel.findById(req.user._id);
    res.send({ user: donator, role: "DONATOR" });
  } else if (req.user.role === "ADMIN") {
    res.send({ user: admin, role: "ADMIN" });
  } else if (req.user.role === "INSTITUTION") {
    const institution = await institutionModel.findById(req.user._id);
    res.send({ user: institution, role: "INSTITUTION" });
  } else {
    next({ status: 401, message: "Invalid role" });
  }
});

// **************************************** ERROR HANDLERS **************************************
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(validationHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("✅ Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port ${port}`);
  });
});
