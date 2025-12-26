import mongoose from 'mongoose';
import React from 'react'
interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}
function Nav({user}:{user:IUser}) {
  return (
    <div>
      
    </div>
  )
}

export default Nav