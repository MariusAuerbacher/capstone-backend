import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const InstitutionSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    number: { type: Number, required: true },
    address: { type: String, required: true },
    paymentOptions: { type: String, required: true },
    politics: { type: String, required: true },
    image: { type: String, required: true },
    password: { type: String, required: true },
      },
  {
    timestamps: true,
  }
);

InstitutionSchema.pre("save", async function () {
  const newInstitutionData = this;
  if (newInstitutionData.isModified("password")) {
    const plainPw = newInstitutionData.password;
    const hash = await bcrypt.hash(plainPw, 16);
    newInstitutionData.password = hash;
  }
});

InstitutionSchema.methods.toJSON = function () {
  const currentInstitution = this.toObject();
  delete currentInstitution.password;
  delete currentInstitution.createdAt;
  delete currentInstitution.updatedAt;
  delete currentInstitution.__v;

  return currentInstitution;
};

InstitutionSchema.static("checkCredentials", async function (email, plainPW) {
  const institution = await this.findOne({ email });
  if (institution) {
    const passwordMatch = await bcrypt.compare(plainPW, institution.password);
    if (passwordMatch) {
      return institution;
    } else {
      return null;
    }
  } else {
    return null;
  }
});


export default model("Institution", InstitutionSchema);