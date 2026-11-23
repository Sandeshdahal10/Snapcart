"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import axios from "axios";
import { CheckCircle, Loader2, MapPin, Package, Phone, User } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Leaflet needs the browser, so the map is only rendered on the client
const LiveMap = dynamic(() => import("./LiveMap"), {
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

function DeliveryBoyDashboard() {
  const { userData } = useSelector((state: RootState) => state.user);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<ILocation | null>(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [delivering, setDelivering] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const fetchAssignments = async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignments");
      setAssignments(result.data.assignments);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCurrentOrder = async () => {
    try {
      const result = await axios.get("/api/delivery/current-order");
      if (result.data.active) {
        const assignment = result.data.assignment;
        setActiveOrder(assignment);
        setUserLocation({
          latitude: assignment.order.address.latitude,
          longitude: assignment.order.address.longitude,
        });
      } else {
        setActiveOrder(null);
        setUserLocation(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!userData?._id) return;
    fetchAssignments();
    fetchCurrentOrder();
  }, [userData?._id]);

  // Live: new broadcasts, and remove ones another delivery boy already took
  useEffect(() => {
    const socket = getSocket();
    const onNew = (deliveryAssignment: any) => {
      setAssignments((prev) =>
        prev.some((a) => a._id === deliveryAssignment._id)
          ? prev
          : [deliveryAssignment, ...prev],
      );
    };
    const onTaken = ({ assignmentId }: { assignmentId: string }) => {
      setAssignments((prev) => prev.filter((a) => String(a._id) !== String(assignmentId)));
    };
    socket.on("new-delivery-assignment", onNew);
    socket.on("assignment-taken", onTaken);
    return () => {
      socket.off("new-delivery-assignment", onNew);
      socket.off("assignment-taken", onTaken);
    };
  }, []);

  // Own position for the map. (GeoMapUpdater on the home page sends it to the server.)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) =>
        setDeliveryBoyLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => console.log(err),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const errorText = (error: any) =>
    error?.response?.data?.message || "Something went wrong. Please try again.";

  const handleAccept = async (id: string) => {
    setBusyId(id);
    setMessage(null);
    try {
      await axios.get(`/api/delivery/assignment/${id}/accept-assignment`);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      await fetchCurrentOrder();
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
      fetchAssignments();
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    setMessage(null);
    try {
      await axios.get(`/api/delivery/assignment/${id}/reject-assignment`);
    } catch (error) {
      console.log(error);
    } finally {
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      setBusyId(null);
    }
  };

  const handleDelivered = async () => {
    if (!activeOrder) return;
    if (otp.trim().length !== 4) {
      setMessage({ type: "error", text: "Enter the 4-digit code from the customer." });
      return;
    }
    setDelivering(true);
    setMessage(null);
    try {
      await axios.post(`/api/delivery/assignment/${activeOrder._id}/deliver`, {
        otp: otp.trim(),
      });
      setOtp("");
      setActiveOrder(null);
      setUserLocation(null);
      setMessage({ type: "success", text: "Order delivered. Great job! 🎉" });
      fetchAssignments();
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setDelivering(false);
    }
  };

  const messageBox = message && (
    <div
      className={`mb-4 rounded-lg px-4 py-3 text-sm border ${
        message.type === "error"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-green-50 border-green-200 text-green-700"
      }`}
    >
      {message.text}
    </div>
  );

  if (activeOrder && userLocation) {
    const order = activeOrder.order;
    return (
      <div className="p-4 pt-[120px] min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-green-700 mb-2">Active Delivery</h1>
          <p className="text-gray-600 text-sm mb-4">
            Order #{String(order?._id).slice(-6)}
          </p>
          {messageBox}
          <div className="rounded-xl border shadow-lg overflow-hidden mb-6 bg-white">
            <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
          </div>

          <div className="bg-white rounded-xl border shadow p-5 space-y-2 text-sm text-gray-700 mb-6">
            <p className="flex items-center gap-2 font-semibold">
              <User size={16} className="text-green-600" /> {order.address.fullName}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-green-600" />
              <a href={`tel:+977${order.address.mobile}`} className="text-blue-600 underline">
                {order.address.mobile}
              </a>
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={16} className="text-green-600 shrink-0 mt-0.5" />
              {order.address.fullAddress}
            </p>
            <p className="flex items-center gap-2">
              <Package size={16} className="text-green-600" />
              {order.items.length} items ·{" "}
              {order.paymentMethod === "COD" ? (
                <b className="text-red-600">Collect ${order.totalPrice} cash</b>
              ) : (
                <span className="text-green-700 font-semibold">Paid online</span>
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Complete delivery</h2>
            <p className="text-xs text-gray-500 mb-3">
              Ask the customer for the 4-digit code shown in their &quot;My Orders&quot; page.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                className="w-32 border rounded-lg px-3 py-2 text-lg tracking-[0.4em] text-center outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleDelivered}
                disabled={delivering}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition"
              >
                {delivering ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                Mark as Delivered
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mt-[120px] mb-[30px]">Delivery Assignments</h2>
        {messageBox}
        {assignments.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <Package className="mx-auto text-green-600 mb-3" size={56} />
            No delivery requests right now. New ones will appear here automatically.
          </div>
        )}
        {assignments.map((a) => (
          <div key={a._id} className="p-5 bg-white rounded-xl shadow mb-4 border">
            <p>
              <b>Order ID: </b> #{String(a?.order?._id).slice(-6)}
            </p>
            <p className="text-gray-600">{a.order?.address?.fullAddress}</p>
            <p className="text-sm text-gray-500 mt-1">
              {a.order?.items?.length} items · ${a.order?.totalPrice} ·{" "}
              {a.order?.paymentMethod === "COD" ? "Cash on Delivery" : "Paid online"}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-2 rounded-lg"
                disabled={busyId === a._id}
                onClick={() => handleAccept(a._id)}
              >
                {busyId === a._id ? "…" : "Accept"}
              </button>
              <button
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2 rounded-lg"
                disabled={busyId === a._id}
                onClick={() => handleReject(a._id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;
