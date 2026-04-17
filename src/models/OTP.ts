import { Schema, model, models } from "mongoose";

const otpSchema = new Schema({
  identifier: { type: String, required: true, index: true },
  channel: { type: String, enum: ["email", "mobile"], required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  consumedAt: { type: Date, default: null },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.OTP || model("OTP", otpSchema);
