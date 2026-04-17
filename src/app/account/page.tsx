import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) redirect("/");

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-semibold">Your account</h1>
      <p className="text-lokus-text/70">Use `/account/addresses` and `/account/orders` for profile operations.</p>
    </div>
  );
}
