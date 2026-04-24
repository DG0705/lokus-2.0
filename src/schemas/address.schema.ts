import { z } from "zod";

// Helper function to validate Indian PIN codes (exactly 6 digits)
const indianPinCodeRegex = /^\d{6}$/;

export const addressSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  phone: z.string().min(10).max(15).trim(),
  line1: z.string().min(3).max(200).trim(),
  line2: z.string().max(200).trim().optional().default(""),
  city: z.string().min(2).max(50).trim(),
  state: z.string().min(2).max(50).trim(),
  postalCode: z.string()
    .regex(indianPinCodeRegex, "Indian PIN code must be exactly 6 digits")
    .trim(),
  country: z.string().max(50).trim().default("India"),
  isDefault: z.boolean().optional().default(false),
});
