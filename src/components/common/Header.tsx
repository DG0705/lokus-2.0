"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function Header() {
  const router = useRouter();
  const { openCart, items } = useCart();
  const [query, setQuery] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/category?q=${encodeURIComponent(q)}` : "/category");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#D4C4B7] bg-[#F9F7F5]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[#2C2B2B]">
        <Link href="/" className="text-xl font-semibold tracking-[0.22em]">LOKUS</Link>
        <div className="flex items-center gap-4 text-sm">
          <form onSubmit={onSearch} className="hidden items-center gap-2 rounded-full border border-[#D4C4B7] bg-white px-3 py-1.5 md:flex">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shoes"
              className="w-36 bg-transparent text-sm outline-none"
            />
          </form>
          <Link href="/account" className="inline-flex items-center gap-1.5"><User className="h-4 w-4" />Profile</Link>
          <button onClick={openCart} className="inline-flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4" />Cart
            <span className="rounded-full bg-[#2C2B2B] px-2 py-0.5 text-[10px] text-white">{items.length}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
