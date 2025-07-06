import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CustomerCartProduct, CustomerCartProductState } from "../../utils/interfaces";

const initialState: CustomerCartProductState = {
    value: [],
} 
const customerCartProductSlice = createSlice({
    name: "CustomerCartProduct",
    initialState,
    reducers:{
        addCartProduct(state, action: PayloadAction<CustomerCartProduct>) {
            const existingItem = state.value.find(item => item.id === action.payload.id);
            if (existingItem) {
              existingItem.quantity += action.payload.quantity;
            } else {
              state.value.push(action.payload);
            }
          },
        removeCartProduct(state, action: PayloadAction<string>){
            state.value= state.value.filter(x => x.id!=action.payload);
        },
    }
});

export default customerCartProductSlice.reducer;
export const {addCartProduct, removeCartProduct} = customerCartProductSlice.actions;