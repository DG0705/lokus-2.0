import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { assertOtpRequestAllowed, createOtp, OtpRateLimitError } from "@/lib/otp";
import { sendEmailOtp, sendMobileOtp } from "@/lib/mailer";
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
    const clientIp = getClientIp(request);
    await assertOtpRequestAllowed(parsed.data.identifier, parsed.data.channel, clientIp);

    const { code } = await createOtp(parsed.data.identifier, parsed.data.channel);

    if (parsed.data.channel === "email") await sendEmailOtp(parsed.data.identifier, code);
    else await sendMobileOtp(parsed.data.identifier, code);

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
