import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  image?: string;
  createdAt?:Date;
  updatedAt?:Date;
}

