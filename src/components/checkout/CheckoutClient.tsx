"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const existing = document.getElementById("razorpay-sdk");
    if (existing) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutClient({ addresses }: { addresses: any[] }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?._id?.toString() ?? "");
  const [isPaying, setIsPaying] = useState(false);

  const amount = useMemo(() => subtotal(), [subtotal]);

  const handlePay = async () => {
    if (!items.length) return alert("Cart is empty");
    if (!selectedAddressId) return alert("Select an address first");

    setIsPaying(true);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error("Failed to load Razorpay SDK");

      const cartItems = items.map((i) => ({ shoeId: i.shoeId, variantId: i.variantId, quantity: i.quantity }));

      const createOrderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId, cartItems }),
      });
      const createOrderData = await createOrderRes.json();
      if (!createOrderRes.ok) throw new Error(createOrderData.message || "Failed to create order");

      const options = {
        key: createOrderData.data.key,
        amount: createOrderData.data.amount,
        currency: "INR",
        name: "LOKUS",
        description: "Premium Footwear Purchase",
        order_id: createOrderData.data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                addressId: selectedAddressId,
                cartItems,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || "Payment verification failed");
            }
            
            // Only clear cart after successful verification
            clearCart();
            alert("Payment successful. Order placed!");
            router.push(`/checkout/success/${verifyData.data.orderId}`);
            router.refresh();
          } catch (error) {
            // On verification failure, redirect to failure page
            console.error("Payment verification failed:", error);
            router.push("/checkout/failure");
          }
        },
        theme: { color: "#B58B6B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-xl font-semibold">Select address</h2>
        <div className="mt-4 space-y-3">
          {addresses.map((address: any) => (
            <label key={address._id.toString()} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#D4C4B7] bg-white p-4">
              <input
                type="radio"
                name="address"
                value={address._id.toString()}
                checked={selectedAddressId === address._id.toString()}
                onChange={() => setSelectedAddressId(address._id.toString())}
              />
              <div>
                <p className="font-medium">{address.fullName}</p>
                <p className="text-sm text-[#2C2B2B]/70">{address.line1}, {address.city}, {address.state} {address.postalCode}</p>
              </div>
            </label>
          ))}
          {!addresses.length ? <p className="text-sm text-[#2C2B2B]/70">No addresses found. Add one from `/account/addresses`.</p> : null}
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-[#D4C4B7] bg-white p-5">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <p className="mt-2 text-sm text-[#2C2B2B]/70">{items.length} items in cart</p>
        <p className="mt-4 text-lg font-semibold">Total: ₹{(amount / 100).toLocaleString("en-IN")}</p>
        <button
          onClick={handlePay}
          disabled={isPaying || !items.length || !addresses.length}
          className="mt-5 w-full rounded-full bg-[#B58B6B] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPaying ? "Processing..." : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );
}
