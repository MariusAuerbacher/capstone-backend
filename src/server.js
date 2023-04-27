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

const server = Express();
const port = process.env.PORT || 3001;

const publicFolderPath = join(process.cwd(), "./public");
server.use(Express.static(publicFolderPath));

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

// ****************************************** ENDPOINTS *****************************************
server.use("/institutions", institutionRouter);
server.use("/users", userRouter);


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
