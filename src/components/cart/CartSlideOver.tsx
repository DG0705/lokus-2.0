"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, ArrowRight } from "lucide-react";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function CartSlideOver() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, justAddedItems } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div 
        className={`absolute inset-0 bg-black/35 transition-all duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`} 
        onClick={closeCart} 
      />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-all duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-[#2C2B2B]">Cart ({items.length})</h2>
            <button 
              onClick={closeCart} 
              className="rounded-lg p-2 text-sm text-[#2C2B2B]/70 hover:bg-gray-100 hover:text-[#2C2B2B] transition-colors"
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              // Premium Empty Cart State
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="mb-6">
                  <ShoppingBag className="h-24 w-24 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is lonely</h3>
                <p className="text-gray-600 mb-8 max-w-sm">
                  Fill it up with our premium footwear collection and get ready to step in style.
                </p>
                <Link 
                  href="/category" 
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2C2B2B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2C2B2B]/90 transition-colors"
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              // Cart Items
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.variantId} 
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      justAddedItems.includes(item.variantId) 
                        ? 'border-green-500 bg-green-50 shadow-lg' 
                        : 'border-[#D4C4B7] bg-white'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={item.image || "/shoe-placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          {item.color} {item.size ? `/ EU ${item.size}` : ""}
                        </p>
                        <p className="text-sm font-medium text-[#B58B6B]">{formatINR(item.price)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          className="rounded-lg border border-gray-300 p-1 hover:bg-gray-50 transition-colors"
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button 
                          className="rounded-lg border border-gray-300 p-1 hover:bg-gray-50 transition-colors"
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="text-xs text-red-600 hover:text-red-700 transition-colors"
                        onClick={() => removeItem(item.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-5">
              <div className="mb-4 flex justify-between text-lg">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold">{formatINR(subtotal())}</span>
              </div>
              <Link 
                href="/checkout" 
                onClick={closeCart}
                className="block w-full rounded-full bg-[#2C2B2B] px-4 py-3 text-center font-semibold text-white hover:bg-[#2C2B2B]/90 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
