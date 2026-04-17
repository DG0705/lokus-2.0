import { Schema, model, models } from "mongoose";

const rateLimitSchema = new Schema({
  scope: { type: String, required: true },
  key: { type: String, required: true },
  windowStart: { type: Date, required: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

rateLimitSchema.index({ scope: 1, key: 1, windowStart: 1 }, { unique: true });
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.RateLimit || model("RateLimit", rateLimitSchema);
