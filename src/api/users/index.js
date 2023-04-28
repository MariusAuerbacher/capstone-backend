import createError from "http-errors";
import UserModel from "./model.js";
import InstitutionModel from "../institutions/model.js";
import express from "express";
import { createAccessToken } from "../../lib/auth/tools.js";
import passport from "passport";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";
import { admin } from "../../lib/auth/admin.js";

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return next({ status: 422, message: "Email already exists" });
  }
  const user = new UserModel({ name, email, password });
  console.log(user);
  await user.save();
  const token = await createAccessToken({
    _id: user._id.toString(),
    role: "DONATOR",
  });
  res.json({ user, token, role: "DONATOR" });
});

userRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = await createAccessToken({
      role: "ADMIN",
    });
    res.send({ token, user: admin, role: "ADMIN" });
    return;
  }

  const user = await UserModel.checkCredentials(email, password);
  console.log("user->", user);
  if (!user) {
      return next({ status: 422, message: "Email or password is incorrect" });
  }

  const token = await createAccessToken({
    _id: user._id.toString(),
    role: "DONATOR",
  });
  res.send({ token, user, role: "DONATOR" });
});

userRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  })
);

userRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
  async (req, res, next) => {
    try {
      res.redirect(
        `${process.env.FE_DEV_URL}/main?accessToken=${req.user.accessToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

/*userRouter.post("/", async (req, res, next) => {
  try {
    const user = new UserModel(req.body);
    const { _id } = await user.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});*/

userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

userRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UserModel.findByIdAndUpdate(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default userRouter;
