import { apiError } from "@/lib/api-response";

export async function POST() {
  return apiError("Use NextAuth credentials signIn for OTP verification", 405);
}
