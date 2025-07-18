import Button, { ButtonType } from "./Button";
import { ShoppingCartIcon } from "./ShoppingCartIcon";
import { Menu, X } from "lucide-react";
import Cart from "./Cart";
import { useSelector } from "react-redux";
import type { RootState } from "../store/Store";
import { useDispatch } from "react-redux";
import { closeCart, openCart, toggleCart } from "../store/slices/showCart";

function Navbar() {
  const showCartStatus = useSelector((state:RootState)=>state.showCart);
  const dispatch = useDispatch();

  return (
    <>
      <nav className="w-full bg-black text-white fixed top-0 left-0 z-50 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-8 py-3 gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="text-lg font-bold">
              <a href="https://www.cloudshop.click">CloudShop</a>
            </div>
            <div className="md:hidden">
            <button onClick={() => dispatch(toggleCart())}> 
                {showCartStatus.valueOf() ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          <form className="w-full md:w-1/2 flex gap-2">
            <input
              type="search"
              id="default-search"
              className="w-full p-2 text-sm text-white border border-gray-600 rounded-lg bg-gray-800 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search products..."
              required
            />
            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Search
            </button>
          </form>

          <div className="hidden md:flex items-center gap-4">
            <Button value="Sign Up" type={ButtonType.Secondary} />
            <Button value="Log in" type={ButtonType.Secondary} />
            <button onClick={() => dispatch(openCart())} className="p-2">
              <ShoppingCartIcon />
            </button>
          </div>
        </div>

        {showCartStatus && (
          <div className="md:hidden flex flex-col items-end gap-2 px-4 pb-4">
            <Button value="Sign Up" type={ButtonType.Secondary} />
            <Button value="Log in" type={ButtonType.Secondary} />
            <button onClick={() => dispatch(openCart())} className="p-2">
              <ShoppingCartIcon />
            </button>
          </div>
        )}
      </nav>

      {showCartStatus && <Cart onClose={() => dispatch(closeCart())} />}
    </>
  );
}

export { Navbar };
