import { redirect } from "next/navigation";

type SearchParams = {
  callbackUrl?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SignupPage({ searchParams }: { searchParams?: SearchParams }) {
  const callbackUrl = firstParam(searchParams?.callbackUrl);

  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    redirect(`/login?mode=signup&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  redirect("/login?mode=signup");
}
