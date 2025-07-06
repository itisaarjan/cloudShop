import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CustomerCartProduct, CustomerCartProductState } from "../../utils/interfaces";

const initialState: CustomerCartProductState = {
    value: [],
} 
const customerCartProductSlice = createSlice({
    name: "CustomerCartProduct",
    initialState,
    reducers:{
        addCartProduct(state, action:PayloadAction<CustomerCartProduct>){
            state.value.push(action.payload);
        },
        removeCartProduct(state, action: PayloadAction<CustomerCartProduct>){
            state.value= state.value.filter(x => x.id!=action.payload.id);
        },
    }
});

export default customerCartProductSlice.reducer;
export const {addCartProduct, removeCartProduct} = customerCartProductSlice.actions;