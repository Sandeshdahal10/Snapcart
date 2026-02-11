/**
 * user.model.ts
 * Mongoose User model and TypeScript IUser interface.
 * Defines the shape of user documents and exports a cached Mongoose model.
 */

import mongoose from "mongoose";

/** IUser
 * Represents a user document in MongoDB.
 * - _id: optional ObjectId assigned by MongoDB
 * - name, email, password: required strings
 * - mobile: optional contact number
 * - role: one of 'user' | 'deliveryBoy' | 'admin'
 */
export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
   location: {
    type: {
        type: StringConstructor;
        enum: string[];
        default: string;
    };
    coordinates: {
        type: NumberConstructor[];
        default: number[];
    };
},
socketId:string | null;
isOnline?:boolean; 
}

/**
 * Mongoose schema for User.
 * - Enforces required fields and unique email constraint.
 * - Uses timestamps to track createdAt/updatedAt.
 */
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    mobile: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "deliveryBoy", "admin"],
      default: "user",
      required: true,
    },
    image: {
      type: String,
    },
    location: {
      type:{
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      }
    },
    socketId: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" }); // Geospatial index for location queries

/** Export cached Mongoose model for User (prevents recompilation on hot reload). */
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
