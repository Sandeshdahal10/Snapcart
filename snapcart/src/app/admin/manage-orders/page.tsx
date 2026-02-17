"use client";
import AdminOrderCard from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/user.model";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import mongoose from "mongoose";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
interface IOrder {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: [
    {
      grocery: mongoose.Types.ObjectId;
      name: string;
      price: string;
      unit: string;
      image: string;
      quantity: number;
    },
  ];
  isPaid: boolean;
  totalPrice: number;
  paymentMethod: "COD" | "Online";
  address: {
    fullName: string;
    pincode: string;
    city: string;
    state: string;
    mobile: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignedDeliveryBoy?: IUser;
  assignment?: mongoose.Types.ObjectId;
  status: "Pending" | "Out for Delivery" | "Delivered";
  createdAt?: Date;
  updatedAt?: Date;
}

function ManageOrders() {
  const [orders, setOrders] = useState<IOrder[]>();
  const router = useRouter();
  useEffect(() => {
    const getOrders = async () => {
      try {
        const result = await axios.get("/api/auth/admin/get-orders");
        setOrders(result.data.orders);
      } catch (error) {
        console.log(error);
      }
    };
    getOrders();
  }, []);

  useEffect((): any => {
    const socket = getSocket();
    socket?.on("new-order", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev!]);
    });
    return () => socket.off("new-order");
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="text-green-700" size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Manage Orders</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8">
        <div className="space-y-6">
          {orders?.map((order, index) => (
            <AdminOrderCard key={index} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageOrders;
