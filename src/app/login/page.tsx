import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AuthPageClient } from "@/components/auth/AuthPageClient";
import { authOptions } from "@/lib/auth";

type SearchParams = {
  callbackUrl?: string | string[];
  mode?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeCallbackUrl(value: string | string[] | undefined) {
  const candidate = firstParam(value);
  if (candidate && candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  return "/account";
}

function safeMode(value: string | string[] | undefined) {
  return firstParam(value) === "signup" ? "signup" : "signin";
}

export const metadata: Metadata = {
  title: "Login | LOKUS",
  description: "Sign in or create your LOKUS account to manage orders, addresses, and checkout faster.",
};

export default async function LoginPage({ searchParams }: { searchParams?: SearchParams }) {
  const callbackUrl = safeCallbackUrl(searchParams?.callbackUrl);
  const mode = safeMode(searchParams?.mode);
  const session = await getServerSession(authOptions);

  if ((session?.user as { id?: string } | undefined)?.id) {
    redirect(callbackUrl);
  }

  return <AuthPageClient callbackUrl={callbackUrl} initialMode={mode} />;
}
