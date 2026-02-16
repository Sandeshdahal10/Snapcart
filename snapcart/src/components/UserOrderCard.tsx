"use client";
import { getSocket } from "@/lib/socket";
import { IOrder } from "@/models/order.model";
import { get } from "http";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Package,
  Scooter,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { div } from "motion/react-client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function UserOrderCard({ order }: { order: IOrder }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Out for Delivery":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };
  useEffect(():any=>{
    const socket = getSocket();
    socket.on("order-status-update",(data)=>{
      if(data.orderId.toString()===order._id!.toString()){
        setStatus(data.status)
      }
    })
    return()=>socket.off("order-status-update")
  },[])
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            order{" "}
            <span className="text-green-700 font-bold">
              #{order?._id?.toString().slice(-6)}
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order?.createdAt!).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              order.isPaid
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {order.isPaid ? "paid" : "not paid yet"}
          </span>
          <span
            className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusColor(status)}`}
          >
            {status}
          </span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {order.paymentMethod == "COD" ? (
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Scooter className="text-green-600" size={16} />
            Cash on Delivery
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <CreditCard className="text-green-600" size={16} />
            Online Payment
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <MapPin className="text-green-600" size={16} />
          <span className="truncate">{order.address.fullAddress}</span>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <button
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span className="flex items-center gap-2">
              <Package className="text-green-600" size={16} />
              {expanded
                ? "Hide Order Items"
                : `view ${order.items.length} Items`}
            </span>

            {expanded ? (
              <ChevronUp size={16} className="text-green-600" />
            ) : (
              <ChevronDown size={16} className="text-green-600" />
            )}
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} X {item.unit}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    ${Number(item.price) * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Truck className="text-green-600" size={16} />
            <span>
              Delivery:{" "}
              <span className="text-green-700 font-bold">
                {status}
              </span>{" "}
            </span>
          </div>
          <div>
            Total:{" "}
            <span className="text-green-700 font-bold">
              ${order.totalPrice}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default UserOrderCard;
