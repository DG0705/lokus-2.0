import { z } from "zod";

const emailSchema = z.string().email().transform(val => val.toLowerCase().trim());
const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/).trim();
const nameSchema = z.string().trim().min(2).max(60);
const intentSchema = z.enum(["signin", "signup"]);

export const requestOtpSchema = z.object({
  channel: z.enum(["email", "mobile"]),
  identifier: z.string().trim().min(4).transform(val => val.toLowerCase()),
  intent: intentSchema.optional(),
  name: z.string().trim().optional(),
}).superRefine((value, ctx) => {
  const valid = value.channel === "email"
    ? emailSchema.safeParse(value.identifier).success
    : phoneSchema.safeParse(value.identifier).success;

  if (!valid) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid ${value.channel}` });
  }

  if (value.intent === "signup") {
    const parsedName = nameSchema.safeParse(value.name ?? "");
    if (!parsedName.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: parsedName.error.issues[0]?.message ?? "Name is required",
        path: ["name"],
      });
    }
  }
});

export const verifyOtpSchema = requestOtpSchema.extend({
  otp: z.string().trim().length(6, "Enter the 6-digit OTP"),
});
