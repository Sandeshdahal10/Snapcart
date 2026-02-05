import mongoose from "mongoose";

export interface IOrder {
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
  assignedDeliveryBoy?: mongoose.Types.ObjectId;
  assignment?: mongoose.Types.ObjectId;
  status: "Pending" | "Out for Delivery" | "Delivered";
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        grocery: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Grocery",
          required: true,
        },
        name: String,
        price: String,
        unit: String,
        image: String,
        quantity: Number,
      },
    ],
    totalPrice: { type: Number },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["COD", "Online"], default: "COD" },
    address: {
      fullName: String,
      pincode: String,
      city: String,
      state: String,
      mobile: String,
      fullAddress: String,
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ["Pending", "Out for Delivery", "Delivered"],
      default: "Pending",
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    assignedDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
