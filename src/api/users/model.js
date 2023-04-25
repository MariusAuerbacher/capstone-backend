import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
      },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  const newUserData = this;
  if (newUserData.isModified("password")) {
    const plainPw = newUserData.password;
    const hash = await bcrypt.hash(plainPw, 16);
    newUserData.password = hash;
  }
});

UserSchema.methods.toJSON = function () {
  const currentUser = this.toObject();
  delete currentUser.password;
  delete currentUser.createdAt;
  delete currentUser.updatedAt;
  delete currentUser.__v;

  return currentUser;
};

UserSchema.static("checkCredentials", async function (email, plainPW) {
  const user = await this.findOne({ email });
  if (user) {
    const passwordMatch = await bcrypt.compare(plainPW, user.password);
    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});


export default model("User", UserSchema);
