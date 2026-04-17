import Link from "next/link";
import { Footprints, Sparkles, Trees } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-[28px] border border-[#D4C4B7] bg-[#F9F7F5] px-8 py-12">
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-[#D4C4B7] bg-white/60 text-[#B58B6B]">
          <Footprints className="h-14 w-14" />
        </div>
        <h1 className="mt-8 text-5xl font-semibold text-[#2C2B2B]">Step into LOKUS</h1>
        <p className="mt-3 text-[#2C2B2B]/70">Premium Footwear, Uncomplicated.</p>
        <Link
          href="/category/sneakers"
          className="mt-7 inline-block rounded-full bg-[#B58B6B] px-6 py-3 text-sm font-bold text-white"
        >
          SHOP SNEAKERS
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-wide text-[#2C2B2B]">CATEGORIES</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "sneakers", icon: <Footprints className="h-7 w-7" /> },
            { name: "boots", icon: <Trees className="h-7 w-7" /> },
            { name: "heels", icon: <Sparkles className="h-7 w-7" /> },
          ].map((item) => (
            <Link
              key={item.name}
              href={`/category/${item.name}`}
              className="rounded-2xl border border-[#D4C4B7] bg-white p-6 shadow-soft"
            >
              <div className="text-[#B58B6B]">{item.icon}</div>
              <h3 className="mt-4 text-lg font-semibold capitalize text-[#2C2B2B]">{item.name}</h3>
              <p className="mt-2 text-sm font-medium text-[#B58B6B]">→ Explore</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-wide text-[#2C2B2B]">FEATURED SHOES</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: "Air Runner", price: "₹10,999", oldPrice: "₹12,799" },
            { name: "Chelsea Boot", price: "₹20,999", oldPrice: "" },
          ].map((shoe) => (
            <div key={shoe.name} className="rounded-2xl border border-[#D4C4B7] bg-white p-4">
              <div className="flex h-56 items-center justify-center rounded-xl bg-[#F9F7F5] text-[#B58B6B]">
                <Footprints className="h-10 w-10" />
              </div>
              <p className="mt-4 text-base font-semibold text-[#2C2B2B]">{shoe.name}</p>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="font-semibold text-[#B58B6B]">{shoe.price}</span>
                {shoe.oldPrice ? <span className="text-[#2C2B2B]/50 line-through">{shoe.oldPrice}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
