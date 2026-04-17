import { z } from "zod";

export const cartItemSchema = z.object({
  shoeId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().min(1),
});

export const createPaymentOrderSchema = z.object({
  addressId: z.string(),
  cartItems: z.array(cartItemSchema).min(1),
});

export const verifyPaymentSchema = z.object({
  addressId: z.string(),
  cartItems: z.array(cartItemSchema).min(1),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});
