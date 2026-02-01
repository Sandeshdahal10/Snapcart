import mongoose from "mongoose";


interface IOrder {
  _id?:mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items:[{
    grocery: mongoose.Types.ObjectId;
    name: string;
    price: string;
    unit: string;
    image: string;
    quantity: number;
  }]
  totalPrice: string;
  paymentMethod: "COD" | "Online";
  address: {
    fullName: string;
    pincode: string;
    city: string;
    state: string;
    mobile: string;
    fullAddress: string;
    latitude:number;
    longitude:number;
  };
  status: "Pending" |  "Out for Delivery" | "Delivered" 
  createdAt?: Date;
  updatedAt?: Date;
} 
