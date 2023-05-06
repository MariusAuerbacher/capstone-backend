import GoogleStrategy from "passport-google-oauth20";
import UserModel from "../../api/users/model.js";
import { createAccessToken } from "./tools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL}/users/auth/google/callback`,
  },
  async (_, __, profile, passportNext) => {
    try {
      const { email, given_name, family_name, sub } = profile._json;
      console.log("PROFILE:", profile);

      const user = await UserModel.findOne({ email });
      if (user) {
        const accessToken = await createAccessToken({
          _id: user._id,
          role: user.role,
        });

        passportNext(null, { accessToken });
      } else {
        const newUser = new UserModel({
          firstName: given_name,
          lastName: family_name,
          email,
          googleId: sub,
        });

        const createdUser = await newUser.save();

        const accessToken = await createAccessToken({
          _id: createdUser._id,
          role: createdUser.role,
        });

        passportNext(null, { accessToken });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

export default googleStrategy;
