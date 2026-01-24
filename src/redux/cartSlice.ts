import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  quantity: number;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ICartSlice {
  cartData:IGrocery[];
}
const initialState: ICartSlice = {
 cartData: [],
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartData:(state, action:PayloadAction<IGrocery>) => {
      state.cartData.push(action.payload);
    }
  },
});

export const { setCartData } = cartSlice.actions;
export default cartSlice.reducer;