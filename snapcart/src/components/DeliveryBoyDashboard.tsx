"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function DeliveryBoyDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const { userData } = useSelector((state: RootState) => state.user);
  const fetchAssignments = async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignments");
      setAssignments(result.data.assignments);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect((): any => {
    const socket = getSocket();
    socket.on("new-delivery-assignment", (deliveryAssignment) => {
      setAssignments((prev) => [deliveryAssignment, ...prev]);
    });
    return () => socket.off("new-delivery-assignment");
  }, []);
  const handleAccept = async (id: string) => {
    try {
      const result = await axios.get(
        `/api/delivery/assignment/${id}/accept-assignment`,
      );
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCurrentOrder = async () => {
    try {
      const result = await axios.get("/api/delivery/current-order");
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAssignments();
    fetchCurrentOrder();
  }, [userData]);
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mt-[120px] mb-[30px]">
          Delivery Assignments
        </h2>
        {assignments.map((a) => (
          <div
            key={a._id}
            className="p-5 bg-white rounded-xl shadow mb-4 border"
          >
            <p>
              <b>Order ID: </b> #{a?.order._id.slice(-6)}
            </p>
            <p className="text-gray-600">{a.order.address.fullAddress}</p>

            <div className="flex gap-3 mt-4">
              <button
                className=" flex-1 bg-green-500 text-white  py-2 rounded-lg"
                onClick={() => handleAccept(a._id)}
              >
                Accept
              </button>
              <button className="flex-1 bg-red-500 text-white  py-2 rounded-lg">
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
