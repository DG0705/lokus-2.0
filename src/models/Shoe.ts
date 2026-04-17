import { Schema, model, models } from "mongoose";

const variantSchema = new Schema({
  sku: { type: String, required: true },
  size: { type: Number, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
}, { _id: true });

const shoeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ["sneakers", "boots", "heels", "sandals", "loafers", "sports"], index: true },
  images: [{ type: String }],
  variants: { type: [variantSchema], default: [] },
  soldOut: { type: Boolean, default: false, index: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

shoeSchema.pre("save", function(next) {
  this.soldOut = !(this.variants ?? []).some((v: { stock: number }) => v.stock > 0);
  next();
});

export default models.Shoe || model("Shoe", shoeSchema);
