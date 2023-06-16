import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PaymentSchema = new Schema(
  {
    price: { type: Number, required: true },
    donator: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    beneficiary: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Beneficiaries",
    },
    institution: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Institution",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Payment", PaymentSchema);
