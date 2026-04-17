import { Schema, Types, model, models } from "mongoose";

const addressSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default models.Address || model("Address", addressSchema);
