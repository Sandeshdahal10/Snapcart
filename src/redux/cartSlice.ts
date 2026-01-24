import { createSlice } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface ICartSlice {
  
}
const initialState: ICartSlice = {
 
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    
  },
});

export const {  } = cartSlice.actions;
export default cartSlice.reducer;