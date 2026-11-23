"use client";
import { motion } from "motion/react";
import { ArrowLeft, ShoppingCart, XCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

/** Stripe sends the customer here when they cancel the payment. The cart is kept. */
function OrderCancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
      >
        <XCircle className="text-red-500 w-24 h-24 md:w-28 md:h-28" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold text-gray-800 mt-6"
      >
        Payment cancelled
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-sm md:text-base text-gray-600 max-w-md"
      >
        No money was taken. Your cart is still saved, so you can try again or
        choose Cash on Delivery.
      </motion.p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          href="/user/checkout"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition"
        >
          <ShoppingCart size={18} /> Back to Checkout
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-white border text-green-700 font-semibold px-8 py-3 rounded-full hover:bg-green-50 transition"
        >
          <ArrowLeft size={18} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderCancel;
