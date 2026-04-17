import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  mobile: { type: String, unique: true, sparse: true, trim: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  name: { type: String, default: "" },
}, { timestamps: true });

export default models.User || model("User", userSchema);
