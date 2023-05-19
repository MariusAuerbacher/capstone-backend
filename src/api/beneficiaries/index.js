import createError from "http-errors";
import BeneficiariesModel from "./model.js";
import express from "express";
import { createAccessToken } from "../../lib/auth/tools.js";
import passport from "passport";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";

const beneficiariesRouter = express.Router();
const admin = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};
beneficiariesRouter.post(
  "/register",
  JWTAuthMiddleware,
  async (req, res, next) => {
    if (req.user.role !== "INSTITUTION") {
      return next({
        status: 401,
        message: "Only Institutions can add a beneficiary",
      });
    }
    const {
      name,
      email,
      category,
      description,
      address,
      country,
      number,
      paymentOptions,
      image,
      password,
      location,
    } = req.body;
    const beneficiaryExists = await BeneficiariesModel.findOne({ email });
    if (beneficiaryExists) {
      return next({ status: 422, message: "Email already exists" });
    }
    const beneficiary = new BeneficiariesModel({
      name,
      email,
      category,
      description,
      address,
      country,
      number,
      paymentOptions,
      image,
      password,
      institution: req.user._id,
      location,
    });
    console.log(beneficiary);
    await beneficiary.save();
    res.json({ beneficiary });
  }
);

beneficiariesRouter.post("/login", async (req, res, next) => {
  const { email, password, rememberMe = false } = req.body;

  const beneficiary = await BeneficiariesModel.checkCredentials(
    email,
    password
  );
  console.log("beneficiary->", beneficiary);
  if (!beneficiary) {
    return next({ status: 422, message: "Email or password is incorrect" });
  }

  const token = await createAccessToken(
    {
      _id: beneficiary._id.toString(),
      role: "BENEFICIARY",
    },
    rememberMe === true ? "4 weeks" : "1 day"
  );
  res.send({ token, beneficiary, role: "BENEFICIARY" });
});

beneficiariesRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  })
);

beneficiariesRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
  async (req, res, next) => {
    try {
      res.redirect(
        `${process.env.FE_DEV_URL}/main?accessToken=${req.beneficiary.accessToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

/*beneficiariesRouter.post("/", async (req, res, next) => {
  try {
    const beneficiary = new BeneficiariesModel(req.body);
    const { _id } = await beneficiary.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});*/

beneficiariesRouter.get("/me", async (req, res, next) => {
  try {
    const beneficiary = await BeneficiariesModel.findById(req.beneficiary._id);
    res.send(beneficiary);
  } catch (error) {
    next(error);
  }
});

beneficiariesRouter.get("/", async (req, res, next) => {
  try {
    const beneficiaries = await BeneficiariesModel.find().populate(
      "institution"
    );
    res.send(beneficiaries);
  } catch (error) {
    next(error);
  }
});

beneficiariesRouter.get("/institution", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const beneficiaries = await BeneficiariesModel.find({institution: req.user._id}).populate(
      "institution"
    );
    res.send(beneficiaries);
  } catch (error) {
    next(error);
  }
});

beneficiariesRouter.get("/:beneficiaryId", async (req, res, next) => {
  try {
    const beneficiary = await BeneficiariesModel.findById(
      req.params.beneficiaryId
    );
    if (beneficiary) {
      res.send(beneficiary);
    } else {
      next(
        createError(
          404,
          `Beneficiary with id ${req.params.beneficiaryId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

beneficiariesRouter.put("/:beneficiaryId", async (req, res, next) => {
  try {
    const updatedBeneficiary = await BeneficiariesModel.findByIdAndUpdate(
      req.params.beneficiaryId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedBeneficiary) {
      res.send(updatedBeneficiary);
    } else {
      next(
        createError(
          404,
          `Institution with id ${req.params.beneficiaryId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

beneficiariesRouter.delete("/:beneficiaryId", async (req, res, next) => {
  try {
    const deletedBenficiary = await BeneficiariesModel.findByIdAndUpdate(
      req.params.beneficiaryId
    );
    if (deletedBenficiary) {
      res.status(204).send();
    } else {
      next(
        createError(
          404,
          `Beneficiary with id ${req.params.beneficiaryId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default beneficiariesRouter;
