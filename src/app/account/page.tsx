import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Package } from "lucide-react";
import { authOptions } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; name?: string | null; email?: string | null; mobile?: string | null } | undefined;

  if (!user?.id) redirect("/login?callbackUrl=%2Faccount");

  const firstName = user.name?.trim()?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-[#D4C4B7] bg-[#F1E7DE] px-8 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#B58B6B]">LOKUS Member</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#2C2B2B]">Welcome back, {firstName}.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#2C2B2B]/70">
          Manage your saved addresses, review your orders, and move through checkout faster the next time a pair catches your eye.
        </p>
        <p className="mt-5 text-sm text-[#2C2B2B]/58">{user.email || user.mobile}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/account/orders" className="rounded-[28px] border border-[#D4C4B7] bg-white p-6 shadow-soft transition hover:-translate-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9F7F5] text-[#B58B6B]">
            <Package className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-[#2C2B2B]">Orders</h2>
          <p className="mt-2 text-sm leading-6 text-[#2C2B2B]/68">Check recent purchases, payment updates, and fulfillment status.</p>
          <p className="mt-4 text-sm font-semibold text-[#B58B6B]">View your orders</p>
        </Link>

        <Link href="/account/addresses" className="rounded-[28px] border border-[#D4C4B7] bg-white p-6 shadow-soft transition hover:-translate-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9F7F5] text-[#B58B6B]">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-[#2C2B2B]">Addresses</h2>
          <p className="mt-2 text-sm leading-6 text-[#2C2B2B]/68">Save delivery details for home, work, and gifting with less friction at checkout.</p>
          <p className="mt-4 text-sm font-semibold text-[#B58B6B]">Manage saved addresses</p>
        </Link>
      </section>
    </div>
  );
}
