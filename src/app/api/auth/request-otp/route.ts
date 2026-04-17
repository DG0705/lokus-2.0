import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertOtpRequestAllowed, createOtp, OtpRateLimitError } from "@/lib/otp";
import { sendEmailOtp, sendMobileOtp } from "@/lib/mailer";
import User from "@/models/User";
import { requestOtpSchema } from "@/schemas/auth.schema";

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? null;

  return (
    request.headers.get("x-real-ip")?.trim() ??
    request.headers.get("cf-connecting-ip")?.trim() ??
    request.headers.get("x-vercel-forwarded-for")?.trim() ??
    null
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestOtpSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);

    await connectToDatabase();

    const identifier = parsed.data.channel === "email" ? parsed.data.identifier.toLowerCase() : parsed.data.identifier;
    const field = parsed.data.channel === "email" ? { email: identifier } : { mobile: identifier };
    const existingUser = await User.findOne(field).select("_id").lean();

    if (parsed.data.intent === "signin" && !existingUser) {
      return apiError(
        `No account found with that ${parsed.data.channel === "email" ? "email address" : "mobile number"}. Create one instead.`,
        404,
        "ACCOUNT_NOT_FOUND",
      );
    }

    if (parsed.data.intent === "signup" && existingUser) {
      return apiError("An account already exists for that contact. Sign in instead.", 409, "ACCOUNT_EXISTS");
    }

    const clientIp = getClientIp(request);
    await assertOtpRequestAllowed(identifier, parsed.data.channel, clientIp);

    const { code } = await createOtp(identifier, parsed.data.channel);

    if (parsed.data.channel === "email") await sendEmailOtp(identifier, code);
    else await sendMobileOtp(identifier, code);

    return apiSuccess({ sent: true }, "OTP sent");
  } catch (error) {
    if (error instanceof OtpRateLimitError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errorCode: error.errorCode,
        },
        {
          status: 429,
          headers: {
            "Retry-After": error.retryAfterSeconds.toString(),
          },
        },
      );
    }

    return apiError(error instanceof Error ? error.message : "Failed to send OTP", 500);
  }
}
