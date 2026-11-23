"use client";
import dynamic from "next/dynamic";

// The checkout map uses Leaflet, which needs `window`, so render it only in the browser
const CheckoutForm = dynamic(() => import("@/components/CheckoutForm"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
      Loading checkout…
    </div>
  ),
});

export default function CheckoutPage() {
  return <CheckoutForm />;
}
