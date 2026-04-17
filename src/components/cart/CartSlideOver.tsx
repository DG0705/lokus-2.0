"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount / 100);
}

export function CartSlideOver() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/35 transition ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={closeCart} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-5 shadow-xl transition ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#2C2B2B]">Cart</h2>
          <button onClick={closeCart} className="text-sm text-[#2C2B2B]/70">Close</button>
        </div>
        <div className="h-[calc(100%-140px)] space-y-3 overflow-y-auto">
          {items.length === 0 && <p className="text-sm text-[#2C2B2B]/60">Your cart is empty.</p>}
          {items.map((item) => (
            <div key={item.variantId} className="rounded-2xl border border-[#D4C4B7] p-3">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-[#2C2B2B]/60">{item.color} {item.size ? `/ EU ${item.size}` : ""}</p>
              <p className="text-sm font-medium text-[#B58B6B]">{formatINR(item.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="rounded border px-2" onClick={() => updateQty(item.variantId, item.quantity - 1)}>-</button>
                <span className="text-sm">{item.quantity}</span>
                <button className="rounded border px-2" onClick={() => updateQty(item.variantId, item.quantity + 1)}>+</button>
                <button className="ml-auto text-xs text-red-600" onClick={() => removeItem(item.variantId)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-3">
          <div className="mb-3 flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatINR(subtotal())}</span>
          </div>
          <Link href="/checkout" onClick={closeCart} className="block rounded-full bg-[#2C2B2B] px-4 py-2 text-center text-sm font-semibold text-white">Proceed to Checkout</Link>
        </div>
      </aside>
    </div>
  );
}
