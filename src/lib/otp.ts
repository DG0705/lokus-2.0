import bcrypt from "bcryptjs";
import OTP from "@/models/OTP";
import RateLimit from "@/models/RateLimit";

const OTP_IDENTIFIER_COOLDOWN_MS = 60 * 1000;
const OTP_IDENTIFIER_WINDOW_MS = 5 * 60 * 1000;
const OTP_IDENTIFIER_MAX_REQUESTS = 3;
const OTP_IP_WINDOW_MS = 5 * 60 * 1000;
const OTP_IP_MAX_REQUESTS = 10;

type OtpChannel = "email" | "mobile";

type RateLimitRule = {
  scope: string;
  key: string;
  windowMs: number;
  limit: number;
  message: string;
};

export class OtpRateLimitError extends Error {
  errorCode = "OTP_RATE_LIMITED";
  retryAfterSeconds: number;

  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  }
}

function getWindowStart(now: Date, windowMs: number) {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

async function consumeRateLimit(rule: Pick<RateLimitRule, "scope" | "key" | "windowMs">) {
  const now = new Date();
  const windowStart = getWindowStart(now, rule.windowMs);
  const expiresAt = new Date(windowStart.getTime() + rule.windowMs);

  try {
    const record = await RateLimit.findOneAndUpdate(
      { scope: rule.scope, key: rule.key, windowStart },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return {
      count: record.count,
      retryAfterMs: Math.max(1000, expiresAt.getTime() - now.getTime()),
    };
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;

    const record = await RateLimit.findOneAndUpdate(
      { scope: rule.scope, key: rule.key, windowStart },
      { $inc: { count: 1 } },
      { new: true },
    );

    if (!record) throw error;

    return {
      count: record.count,
      retryAfterMs: Math.max(1000, expiresAt.getTime() - now.getTime()),
    };
  }
}

export async function assertOtpRequestAllowed(identifier: string, channel: OtpChannel, requestedByIp?: string | null) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const rules: RateLimitRule[] = [
    {
      scope: "otp-request:identifier:cooldown",
      key: `${channel}:${normalizedIdentifier}`,
      windowMs: OTP_IDENTIFIER_COOLDOWN_MS,
      limit: 1,
      message: "Please wait a minute before requesting another OTP.",
    },
    {
      scope: "otp-request:identifier:window",
      key: `${channel}:${normalizedIdentifier}`,
      windowMs: OTP_IDENTIFIER_WINDOW_MS,
      limit: OTP_IDENTIFIER_MAX_REQUESTS,
      message: "Too many OTP requests for this identifier. Try again in a few minutes.",
    },
  ];

  if (requestedByIp) {
    rules.push({
      scope: "otp-request:ip:window",
      key: requestedByIp,
      windowMs: OTP_IP_WINDOW_MS,
      limit: OTP_IP_MAX_REQUESTS,
      message: "Too many OTP requests from this network. Try again in a few minutes.",
    });
  }

  for (const rule of rules) {
    const { count, retryAfterMs } = await consumeRateLimit(rule);
    if (count > rule.limit) throw new OtpRateLimitError(rule.message, retryAfterMs);
  }
}

export async function createOtp(identifier: string, channel: OtpChannel) {
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
