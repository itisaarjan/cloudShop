import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductType } from "../../utils/interfaces";



interface ProductState{
    value: ProductType[],
}

const initialState: ProductState = {
    value:[],
}

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers:{
        setProducts(state, action: PayloadAction<ProductType[]>){
            state.value = action.payload
        },
        addProduct(state,action: PayloadAction<ProductType>){
            state.value.push(action.payload)
        },
    },
});

export const {addProduct, setProducts} = productSlice.actions;
export default productSlice.reducer;