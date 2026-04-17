import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AddressesClient } from "@/components/checkout/AddressesClient";

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) redirect("/");

  return (
    <div>
      <h1 className="text-3xl font-semibold">Addresses</h1>
      <p className="mt-2 text-sm text-[#2C2B2B]/70">Create and delete saved delivery addresses.</p>
      <div className="mt-6">
        <AddressesClient />
      </div>
    </div>
  );
}
