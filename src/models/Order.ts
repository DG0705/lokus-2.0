import { Schema, Types, model, models } from "mongoose";

const orderItemSchema = new Schema({
  shoeId: { type: Types.ObjectId, ref: "Shoe", required: true },
  variantId: { type: Types.ObjectId, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  color: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  addressId: { type: Types.ObjectId, ref: "Address", required: true },
  items: { type: [orderItemSchema], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "paid", "failed", "shipped", "delivered"], default: "pending" },
  trackingNumber: { type: String, trim: true, default: null },
  courierPartner: { type: String, trim: true, default: null },
  payment: {
    provider: { type: String, default: "razorpay" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
}, { timestamps: true });

export default models.Order || model("Order", orderSchema);
