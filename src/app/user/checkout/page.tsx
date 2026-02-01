"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building,
  CreditCard,
  HomeIcon,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  Truck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Marker, useMap } from "react-leaflet";
import axios from "axios";
import { OpenStreetMapProvider } from "leaflet-geosearch";
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/2642/2642502.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
function Checkout() {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pin: "",
    fullAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Online">("COD");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Geolocation position:", pos);
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          (console.error("Geolocation error:", err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
        },
      );
    }
  }, []);
  useEffect(() => {
    setAddress((prev) => ({ ...prev, fullName: userData?.name || "" }));
    setAddress((prev) => ({ ...prev, mobile: userData?.mobile || "" }));
  }, [userData]);

  const DraggableMarker: React.FC = () => {
    const map = useMap();
    (useEffect(() => {
      map.setView(position as LatLngExpression, 15, { animate: true });
    }),
      [position, map]);
    return (
      <Marker
        icon={markerIcon}
        position={position as LatLngExpression}
        draggable={true}
        eventHandlers={{
          dragend: (e: L.LeafletEvent) => {
            const marker = e.target as L.Marker;
            const { lat, lng } = marker.getLatLng();
            setPosition([lat, lng]);
          },
        }}
      />
    );
  };
  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const result = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`,
        );
        console.log(result.data);
        setAddress((prev) => ({
          ...prev,
          city: result.data.address.city,
          state: result.data.address.state,
          pin: result.data.address.postcode,
          fullAddress: result.data.display_name,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAddress();
  }, [position]);

  const handleSearch = async () => {
    setLoading(true);
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: search });
    if (results) {
      setPosition([results[0].y, results[0].x]);
      setLoading(false);
    }
  };

  const handleCurrentLocation= () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Geolocation position:", pos);
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          (console.error("Geolocation error:", err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
        },
      );
    }
  }
  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold"
        onClick={() => router.push("/user/cart")}
      >
        <ArrowLeft size={16} />
        <span>Back to Cart</span>
      </motion.button>
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Checkout
      </motion.h1>
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-green-700" />
            Delivery Address
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                value={address.fullName}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                placeholder="Full Name"
              />
            </div>
            <div className="relative">
              <Phone
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                value={address.mobile}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, mobile: e.target.value }))
                }
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                placeholder="Mobile Number"
              />
            </div>
            <div className="relative">
              <HomeIcon
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                value={address.fullAddress}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullAddress: e.target.value,
                  }))
                }
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                placeholder="Full Address"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Building
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  placeholder="City"
                />
              </div>
              <div className="relative">
                <Navigation
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, state: e.target.value }))
                  }
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  placeholder="State"
                />
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  value={address.pin}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, pin: e.target.value }))
                  }
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                  placeholder="pin"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Search Your city or area..."
                className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700 transition-all font-medium"
                onClick={handleSearch}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  "Search"
                )}
              </button>
            </div>
            <div className="relative mt-6 h-330px rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              {position && (
                <MapContainer
                  center={position as LatLngExpression}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="w-full h-[400px]"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker />
                </MapContainer>
              )}
              <motion.button
                className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-999"
                whileTap={{ scale: 0.93 }} 
                onClick={handleCurrentLocation}
              >
                <LocateFixed size={22} />
              </motion.button>
            </div>
          </div>
        </motion.div>
        <motion.div
        initial={{ opacity: 0, x:20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="text-green-600" />Payment Method</h2>
          <div className="space-y-4 mb-6">
              <button onClick={()=>setPaymentMethod("Online")} className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${
                paymentMethod === "Online"
                ? "border-green-600 bg-green-50 shadow-sm"
                : "hover:bg-gray-50"
              }`}>
                <CreditCard className="text-green-600"/><span className="font-medium text-gray-700">Online Payment</span>
              </button>
              <button onClick={()=>setPaymentMethod("COD")} className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${
                paymentMethod === "COD"
                ? "border-green-600 bg-green-50 shadow-sm"
                : "hover:bg-gray-50"
              }`}>
                <Truck className="text-green-600"/><span className="font-medium text-gray-700">Cash on Delivery</span>
              </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;
