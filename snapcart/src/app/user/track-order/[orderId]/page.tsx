"use client";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { ArrowLeft, KeyRound, Loader2, MapPin, Phone, Truck, UserCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Leaflet needs the browser, so the map is only rendered on the client
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] flex items-center justify-center text-gray-500">
      Loading map…
    </div>
  ),
});

interface ILocation {
  latitude: number;
  longitude: number;
}

function TrackOrder() {
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation | null>(null);

  useEffect(() => {
    const getOrder = async () => {
      try {
        const result = await axios.get(`/api/user/get-order/${orderId}`);
        const o = result.data.order;
        setOrder(o);
        setStatus(o.status);
        const coords = o.assignedDeliveryBoy?.location?.coordinates;
        if (coords && (coords[0] !== 0 || coords[1] !== 0)) {
          setDeliveryBoyLocation({ latitude: coords[1], longitude: coords[0] });
        }
      } catch (error) {
        console.log(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) getOrder();
  }, [orderId]);

  // Live updates: delivery boy position + order status
  useEffect(() => {
    if (!order) return;
    const socket = getSocket();
    const boyId = order.assignedDeliveryBoy?._id;

    const onLocation = ({ userId, location }: any) => {
      if (boyId && String(userId) === String(boyId)) {
        setDeliveryBoyLocation({
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
        });
      }
    };
    const onStatus = (data: any) => {
      if (String(data.orderId) === String(order._id)) setStatus(data.status);
    };

    const onAssigned = (data: any) => {
      if (String(data.orderId) === String(order._id)) {
        setOrder((prev: any) => ({
          ...prev,
          assignedDeliveryBoy: data.assignedDeliveryBoy,
          deliveryOtp: data.deliveryOtp,
        }));
      }
    };

    socket.on("update-deliveryBoy-location", onLocation);
    socket.on("order-status-update", onStatus);
    socket.on("delivery-assigned", onAssigned);
    return () => {
      socket.off("update-deliveryBoy-location", onLocation);
      socket.off("order-status-update", onStatus);
      socket.off("delivery-assigned", onAssigned);
    };
  }, [order?._id, order?.assignedDeliveryBoy?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-600 gap-2">
        <Loader2 className="animate-spin" /> Loading order…
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600 gap-4">
        <p>Order not found.</p>
        <button
          className="bg-green-600 text-white px-5 py-2 rounded-full"
          onClick={() => router.push("/user/my-orders")}
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const boy = order.assignedDeliveryBoy;

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-[1100]">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition"
            onClick={() => router.push("/user/my-orders")}
          >
            <ArrowLeft className="text-green-700" size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Track Order</h1>
            <p className="text-xs text-gray-500">
              Order #{String(order._id).slice(-6)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-10 space-y-5">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="text-green-600" size={18} />
          Status:
          <span className="font-bold text-green-700">{status}</span>
        </div>

        {status === "Delivered" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-700 font-semibold">
            Your order has been delivered. Enjoy! 🎉
          </div>
        ) : (
          <div className="rounded-xl border shadow-lg overflow-hidden bg-white">
            <LiveMap
              userLocation={{
                latitude: order.address.latitude,
                longitude: order.address.longitude,
              }}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>
        )}

        {order.deliveryOtp && status !== "Delivered" && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-center gap-3">
            <KeyRound className="text-yellow-700" />
            <div>
              <p className="text-sm text-gray-700">
                Share this code with the delivery boy when you receive your order:
              </p>
              <p className="text-2xl font-bold tracking-[0.4em] text-gray-900">
                {order.deliveryOtp}
              </p>
            </div>
          </div>
        )}

        {boy && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <UserCheck className="text-blue-600" size={18} />
              <div>
                <p className="font-semibold text-gray-800">{boy.name}</p>
                <p className="text-xs text-gray-600">📱 +977{boy.mobile}</p>
              </div>
            </div>
            <a
              href={`tel:+977${boy.mobile}`}
              className="flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              <Phone size={14} /> Call
            </a>
          </div>
        )}

        <div className="flex items-start gap-2 text-gray-700 text-sm bg-white rounded-xl p-4 border">
          <MapPin className="text-green-600 shrink-0" size={18} />
          <span>{order.address.fullAddress}</span>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
