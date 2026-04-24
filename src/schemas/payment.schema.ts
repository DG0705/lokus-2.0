import { z } from "zod";

// MongoDB ObjectId validation regex (24-character hex string)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const cartItemSchema = z.object({
  shoeId: z.string()
    .regex(objectIdRegex, "Invalid shoe ID format")
    .trim(),
  variantId: z.string()
    .regex(objectIdRegex, "Invalid variant ID format")
    .trim(),
  quantity: z.number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(10, "Quantity cannot exceed 10"),
});

export const createPaymentOrderSchema = z.object({
  addressId: z.string()
    .regex(objectIdRegex, "Invalid address ID format")
    .trim(),
  cartItems: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
});

export const verifyPaymentSchema = z.object({
  addressId: z.string()
    .regex(objectIdRegex, "Invalid address ID format")
    .trim(),
  cartItems: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required").trim(),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required").trim(),
  razorpaySignature: z.string().min(1, "Razorpay signature is required").trim(),
});
