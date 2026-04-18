import { Schema, model, models } from "mongoose";
import { SHOE_CATEGORIES } from "@/lib/catalog-discovery";

const variantSchema = new Schema(
  {
    sku: { type: String, required: true },
    size: { type: Number, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
  },
  { _id: true },
);

const shoeSchema = new Schema(
  {
    brand: { type: String, trim: true, default: "", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: SHOE_CATEGORIES, index: true },
    images: [{ type: String }],
    variants: { type: [variantSchema], default: [] },
    soldOut: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

shoeSchema.pre("save", function(next) {
  this.soldOut = !(this.variants ?? []).some((variant: { stock: number }) => variant.stock > 0);
  next();
});

shoeSchema.index({ "variants.size": 1 });
shoeSchema.index({ "variants.color": 1 });
shoeSchema.index({ "variants.price": 1 });

export default models.Shoe || model("Shoe", shoeSchema);
