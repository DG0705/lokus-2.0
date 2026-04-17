import { connectToDatabase } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createOtp } from "@/lib/otp";
import { sendEmailOtp, sendMobileOtp } from "@/lib/mailer";
import { requestOtpSchema } from "@/schemas/auth.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestOtpSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);

    await connectToDatabase();
    const { code } = await createOtp(parsed.data.identifier, parsed.data.channel);

    if (parsed.data.channel === "email") await sendEmailOtp(parsed.data.identifier, code);
    else await sendMobileOtp(parsed.data.identifier, code);

    return apiSuccess({ sent: true }, "OTP sent");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to send OTP", 500);
  }
}
