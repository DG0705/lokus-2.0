import bcrypt from "bcryptjs";
import OTP from "@/models/OTP";

export async function createOtp(identifier: string, channel: "email" | "mobile") {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OTP.create({ identifier, channel, codeHash, expiresAt });
  return { code, expiresAt };
}

export async function verifyOtp(identifier: string, code: string) {
  const record = await OTP.findOne({ identifier, consumedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!record) return { ok: false as const, reason: "OTP expired or not found" };

  const ok = await bcrypt.compare(code, record.codeHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    return { ok: false as const, reason: "Invalid OTP" };
  }

  record.consumedAt = new Date();
  await record.save();
  return { ok: true as const };
}
