import { z } from "zod";

const emailSchema = z.string().email();
const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/);

export const requestOtpSchema = z.object({
  channel: z.enum(["email", "mobile"]),
  identifier: z.string().min(4),
}).superRefine((v, ctx) => {
  const valid = v.channel === "email" ? emailSchema.safeParse(v.identifier).success : phoneSchema.safeParse(v.identifier).success;
  if (!valid) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid ${v.channel}` });
});

export const verifyOtpSchema = requestOtpSchema.extend({ otp: z.string().length(6) });
