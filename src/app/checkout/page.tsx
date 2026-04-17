import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Address from "@/models/Address";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/");
  await connectToDatabase();
  const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();

  return (
    <div>
      <h1 className="text-4xl font-semibold">Checkout</h1>
      <p className="mt-3 text-lokus-text/70">Secure payment via Razorpay with server-side stock verification.</p>
      <div className="mt-8">
        <CheckoutClient addresses={addresses} />
      </div>
    </div>
  );
}
