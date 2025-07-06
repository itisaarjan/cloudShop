import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import showCartReducer from './slices/showCart'
import CustomerCartReducer from "./slices/CustomerCart";

const store = configureStore({
    reducer: {
        products: productReducer,
        showCart: showCartReducer,
        customerCartProduct: CustomerCartReducer
    }
});

export {store};
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;