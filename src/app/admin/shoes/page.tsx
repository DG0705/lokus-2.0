import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";

export default async function AdminShoesPage() {
  try {
    await connectToDatabase();
    const shoes = await Shoe.find().sort({ createdAt: -1 }).lean();

    return (
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Manage shoes</h1>
          <Link href="/admin/shoes/new" className="rounded-full bg-[#2C2B2B] px-4 py-2 text-sm font-semibold text-white">New shoe</Link>
        </div>
        <div className="space-y-3">
          {shoes.map((s: any) => (
            <div key={s._id.toString()} className="rounded-2xl border border-[#D4C4B7] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-[#2C2B2B]/60">{s.category} · {s.variants?.length ?? 0} variants · {s.soldOut ? "Sold out" : "In stock"}</p>
                </div>
                <Link className="text-sm font-medium text-[#B58B6B]" href={`/admin/shoes/${s._id.toString()}`}>Edit</Link>
              </div>
            </div>
          ))}
          {!shoes.length ? <p className="text-sm text-[#2C2B2B]/70">No shoes yet. Create one to start.</p> : null}
        </div>
      </div>
    );
  } catch (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error instanceof Error ? error.message : "Failed to load admin shoes"}</div>;
  }
}
