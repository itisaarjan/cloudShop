import { createSlice } from "@reduxjs/toolkit";



const initialState = false;

const showCartSlice = createSlice({
    name: 'showCart',
    initialState,
    reducers:{
        openCart(){
            return true;
        },
        toggleCart(state){
            return !state;
        },
        closeCart(){
            return false;
        },
    },
});

export default showCartSlice.reducer;
export const {openCart, toggleCart,closeCart}=showCartSlice.actions;