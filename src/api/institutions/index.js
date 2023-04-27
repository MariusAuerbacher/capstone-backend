import createError from "http-errors";
import InstitutionModel from "./model.js";
import express from "express";
import { createAccessToken } from "../../lib/auth/tools.js";
import passport from "passport";

const institutionRouter = express.Router();
const admin = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};
institutionRouter.post("/iregister", async (req, res, next) => {
  const { name, email, password } = req.body;
  const institutionExists = await InstitutionModel.findOne({ email });
  if (institutionExists) {
    return next({ status: 422, message: "Email already exists" });
  }
  const institution = new InstitutionModel({ name, email, password });
  console.log(institution);
  await institution.save();
  const token = await createAccessToken({
    _id: institution._id.toString(),
    role: "INSTITUTION",
  });
  res.json({ institution, token, role: "INSTITUTION" });
});

institutionRouter.post("/ilogin", async (req, res, next) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = await createAccessToken({
      role: "ADMIN",
    });
    res.send({ token, institution: admin, role: "ADMIN" });
    return;
  }

  const institution = await InstitutionModel.checkCredentials(email, password);
  console.log("institution->", institution);
  if (!institution) {
    return next({ status: 422, message: "Email or password is incorrect" });
  }

  const token = await createAccessToken({
    _id: institution._id.toString(),
    role: "INSTITUTION",
  });
  res.send({ token, institution, role: "INSTITUTION" });
});

institutionRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  })
);

institutionRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
  async (req, res, next) => {
    try {
      res.redirect(
        `${process.env.FE_DEV_URL}/main?accessToken=${req.institution.accessToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

/*institutionRouter.post("/", async (req, res, next) => {
  try {
    const institution = new InstitutionModel(req.body);
    const { _id } = await institution.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});*/

institutionRouter.get("/me", async (req, res, next) => {
  try {
    const institution = await InstitutionModel.findById(req.institution._id);
    res.send(institution);
  } catch (error) {
    next(error);
  }
});

institutionRouter.get("/:institutionId", async (req, res, next) => {
  try {
    const institution = await InstitutionModel.findById(
      req.params.institutionId
    );
    if (institution) {
      res.send(institution);
    } else {
      next(
        createError(
          404,
          `Institution with id ${req.params.institutionId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

institutionRouter.put("/:institutionId", async (req, res, next) => {
  try {
    const updatedInstitution = await InstitutionModel.findByIdAndUpdate(
      req.params.institutionId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedInstitution) {
      res.send(updatedInstitution);
    } else {
      next(
        createError(
          404,
          `Institution with id ${req.params.institutionId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

institutionRouter.delete("/:institutionId", async (req, res, next) => {
  try {
    const deletedInstitution = await InstitutionModel.findByIdAndUpdate(
      req.params.institutionId
    );
    if (deletedInstitution) {
      res.status(204).send();
    } else {
      next(
        createError(
          404,
          `Institution with id ${req.params.institutionId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default institutionRouter;
