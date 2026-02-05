import mongoose from "mongoose";

interface IDeliveryAssignment {
  _id?: mongoose.Types.ObjectId;
  order:mongoose.Types.ObjectId;
  broadcastedTo: mongoose.Types.ObjectId[];
  assignedTo: mongoose.Types.ObjectId | null;
  status:"broadcasted" | "assigned" | "completed";
  acceptedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}