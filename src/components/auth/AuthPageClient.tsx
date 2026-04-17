"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import { signIn } from "next-auth/react";

type AuthMode = "signin" | "signup";
type AuthChannel = "email" | "mobile";

type AuthPageClientProps = {
  callbackUrl: string;
  initialMode: AuthMode;
};

type Feedback = {
  tone: "error" | "success";
  message: string;
} | null;

const perks: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Faster checkout",
    description: "Keep your delivery details ready for your next pair.",
    icon: ShoppingBag,
  },
  {
    title: "Order tracking",
    description: "Follow every order from confirmation to doorstep.",
    icon: Truck,
  },
  {
    title: "Saved addresses",
    description: "Manage home, office, and gifting addresses in one place.",
    icon: MapPin,
  },
];

const trustPoints = [
  "One-time passcode login with no password reset loops.",
  "Use either your email or mobile number, whichever is fastest for you.",
  "Create a new account in under a minute and keep checkout moving.",
];

function fieldClasses(disabled?: boolean) {
  return `mt-2 w-full rounded-[20px] border border-[#D4C4B7] bg-[#F9F7F5] px-4 py-3 text-sm text-[#2C2B2B] outline-none transition placeholder:text-[#2C2B2B]/35 focus:border-[#B58B6B] ${disabled ? "cursor-not-allowed opacity-70" : ""}`;
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

function resolveRedirect(url: string | null | undefined, fallback: string) {
  if (!url) return fallback;

  try {
    const parsed = new URL(url, window.location.origin);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function AuthPageClient({ callbackUrl, initialMode }: AuthPageClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [channel, setChannel] = useState<AuthChannel>("email");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "verify">("details");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [requestPending, startRequestTransition] = useTransition();
  const [verifyPending, startVerifyTransition] = useTransition();

  const channelLabel = channel === "email" ? "email address" : "mobile number";
  const submitPending = requestPending || verifyPending;

  const resetVerification = (nextMode?: AuthMode, nextChannel?: AuthChannel) => {
    if (nextMode) setMode(nextMode);
    if (nextChannel) setChannel(nextChannel);
    setStep("details");
    setOtp("");
    setFeedback(null);
  };

  const requestOtp = async () => {
    const response = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        identifier,
        intent: mode,
        name: mode === "signup" ? name : undefined,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setFeedback({
        tone: "error",
        message: extractMessage(payload, `We couldn't send a code to that ${channelLabel}.`),
      });
      return false;
    }

    setStep("verify");
    setFeedback({
      tone: "success",
      message: `A 6-digit code is on its way to your ${channelLabel}.`,
    });
    return true;
  };

  const handleRequestOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    startRequestTransition(async () => {
      try {
        await requestOtp();
      } catch {
        setFeedback({
          tone: "error",
          message: "Something went wrong while requesting your code. Please try again.",
        });
      }
    });
  };

  const handleVerifyOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    startVerifyTransition(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl,
        channel,
        identifier,
        intent: mode,
        name: mode === "signup" ? name : undefined,
        otp,
      });

      if (!result || result.error) {
        setFeedback({
          tone: "error",
          message: result?.error || (mode === "signup" ? "We couldn't create your account." : "We couldn't sign you in."),
        });
        return;
      }

      router.push(resolveRedirect(result.url, callbackUrl));
      router.refresh();
    });
  };

  const handleResend = () => {
    setFeedback(null);

    startRequestTransition(async () => {
      try {
        const sent = await requestOtp();
        if (sent) setOtp("");
      } catch {
        setFeedback({
          tone: "error",
          message: "We couldn't resend your code right now. Please try again.",
        });
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,520px)]">
      <section className="overflow-hidden rounded-[34px] border border-[#D4C4B7] bg-[#EFE4D9] p-8 shadow-soft md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#B58B6B]">
          <Sparkles className="h-4 w-4" />
          LOKUS Member Access
        </div>

        <div className="mt-8 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#2C2B2B]/48">
            Premium footwear, uncomplicated
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#2C2B2B] md:text-5xl">
            {mode === "signup" ? "Create your LOKUS account for a smoother checkout." : "Welcome back to your LOKUS wardrobe."}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#2C2B2B]/72">
            Access your saved addresses, track every order, and move from discovery to checkout with a simple OTP flow that feels native to
            the rest of the storefront.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.title} className="rounded-[26px] border border-white/70 bg-white/75 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9F7F5] text-[#B58B6B]">
                <perk.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#2C2B2B]">{perk.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#2C2B2B]/68">{perk.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-white/70 bg-white/75 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2C2B2B] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B58B6B]">Secure access</p>
              <p className="mt-1 text-sm text-[#2C2B2B]/68">Built for quick sign-in without adding password friction.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl bg-[#F9F7F5] px-4 py-3">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B58B6B]" />
                <p className="text-sm leading-6 text-[#2C2B2B]/72">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-[#D4C4B7] bg-white p-6 shadow-soft md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B58B6B]">Account</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#2C2B2B]">
              {mode === "signup" ? "Create account" : "Sign in"}
            </h2>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#2C2B2B]/65">
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 inline-flex rounded-full border border-[#D4C4B7] bg-[#F9F7F5] p-1">
          <button
            type="button"
            onClick={() => resetVerification("signin")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "signin" ? "bg-[#2C2B2B] text-white" : "text-[#2C2B2B]/68"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => resetVerification("signup")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-[#2C2B2B] text-white" : "text-[#2C2B2B]/68"}`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={step === "details" ? handleRequestOtp : handleVerifyOtp} className="mt-8 space-y-5">
          {feedback ? (
            <div
              className={`rounded-[24px] border px-4 py-3 text-sm ${
                feedback.tone === "success"
                  ? "border-[#D7C7B8] bg-[#F7F2EC] text-[#6A513D]"
                  : "border-[#E6C7BF] bg-[#FFF5F2] text-[#9B4A3A]"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          {mode === "signup" ? (
            <label className="block text-sm font-medium text-[#2C2B2B]">
              Full name
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B58B6B]" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={step === "verify"}
                  className={`${fieldClasses(step === "verify")} pl-11`}
                />
              </div>
            </label>
          ) : null}

          <div>
            <p className="text-sm font-medium text-[#2C2B2B]">How should we reach you?</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => resetVerification(undefined, "email")}
                className={`flex items-center justify-center gap-2 rounded-[20px] border px-4 py-3 text-sm font-semibold transition ${
                  channel === "email" ? "border-[#B58B6B] bg-[#F6F0EA] text-[#2C2B2B]" : "border-[#D4C4B7] bg-white text-[#2C2B2B]/70"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => resetVerification(undefined, "mobile")}
                className={`flex items-center justify-center gap-2 rounded-[20px] border px-4 py-3 text-sm font-semibold transition ${
                  channel === "mobile" ? "border-[#B58B6B] bg-[#F6F0EA] text-[#2C2B2B]" : "border-[#D4C4B7] bg-white text-[#2C2B2B]/70"
                }`}
              >
                <Phone className="h-4 w-4" />
                Mobile
              </button>
            </div>
          </div>

          <label className="block text-sm font-medium text-[#2C2B2B]">
            {channel === "email" ? "Email address" : "Mobile number"}
            <div className="relative">
              {channel === "email" ? (
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B58B6B]" />
              ) : (
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B58B6B]" />
              )}
              <input
                type={channel === "email" ? "email" : "tel"}
                inputMode={channel === "email" ? "email" : "tel"}
                autoComplete={channel === "email" ? "email" : "tel"}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={channel === "email" ? "name@example.com" : "+91 9876543210"}
                disabled={step === "verify"}
                className={`${fieldClasses(step === "verify")} pl-11`}
              />
            </div>
          </label>

          {step === "verify" ? (
            <>
              <div className="rounded-[24px] border border-[#D4C4B7] bg-[#F9F7F5] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B58B6B]">Verify your code</p>
                <p className="mt-2 text-sm leading-6 text-[#2C2B2B]/70">
                  Enter the 6-digit OTP we sent to <span className="font-semibold text-[#2C2B2B]">{identifier}</span>.
                </p>
              </div>

              <label className="block text-sm font-medium text-[#2C2B2B]">
                One-time password
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  className={`${fieldClasses()} text-center text-lg font-semibold tracking-[0.4em]`}
                />
              </label>
            </>
          ) : null}

          <button
            type="submit"
            disabled={submitPending}
            className="w-full rounded-full bg-[#2C2B2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1E1E] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {step === "verify"
              ? verifyPending
                ? mode === "signup"
                  ? "Creating your account..."
                  : "Signing you in..."
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"
              : requestPending
                ? "Sending OTP..."
                : "Send OTP"}
          </button>

          {step === "verify" ? (
            <div className="flex flex-col gap-3 text-sm text-[#2C2B2B]/68 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => resetVerification()} className="text-left font-medium text-[#2C2B2B]">
                Use a different {channel === "email" ? "email" : "number"}
              </button>
              <button type="button" onClick={handleResend} disabled={submitPending} className="text-left font-medium text-[#B58B6B] disabled:opacity-60">
                Resend code
              </button>
            </div>
          ) : null}
        </form>

        <p className="mt-6 text-sm leading-6 text-[#2C2B2B]/62">
          {mode === "signup"
            ? "Already have a LOKUS account? Switch to sign in and continue where you left off."
            : "New to LOKUS? Create an account to save addresses, track orders, and speed through checkout."}
        </p>
      </section>
    </div>
  );
}
