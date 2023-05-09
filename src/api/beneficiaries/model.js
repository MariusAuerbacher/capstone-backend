import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const BeneficiariesSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    number: { type: Number, required: true },
    address: { type: String, required: true },
    paymentOptions: [{ type: Boolean, required: true }],
    image: { type: String, required: true },
    password: { type: String, required: true },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
    },
    remember: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

BeneficiariesSchema.pre("save", async function () {
  const newBeneficiariesData = this;
  if (newBeneficiariesData.isModified("password")) {
    const plainPw = newBeneficiariesData.password;
    const hash = await bcrypt.hash(plainPw, 16);
    newBeneficiariesData.password = hash;
  }
});

BeneficiariesSchema.methods.toJSON = function () {
  const currentBeneficiary = this.toObject();
  delete currentBeneficiary.password;
  delete currentBeneficiary.createdAt;
  delete currentBeneficiary.updatedAt;
  delete currentBeneficiary.__v;

  return currentBeneficiary;
};

BeneficiariesSchema.static("checkCredentials", async function (email, plainPW) {
  const beneficiary = await this.findOne({ email });
  if (beneficiary) {
    const passwordMatch = await bcrypt.compare(plainPW, beneficiary.password);
    if (passwordMatch) {
      return beneficiary;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("Beneficiaries", BeneficiariesSchema);
