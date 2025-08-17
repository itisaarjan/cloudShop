import Button, { ButtonType } from "./Button";
import { ShoppingCartIcon } from "./ShoppingCartIcon";
import { Menu, X } from "lucide-react";
import Cart from "./Cart";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/Store";
import { closeCart, openCart, toggleCart } from "../store/slices/showCart";

function Navbar() {
  const isCartOpen = useSelector((state: RootState) => state.showCart); // boolean
  const dispatch = useDispatch();

  const cognitoDomain = "https://cloudshop.auth.us-east-1.amazoncognito.com";
  const clientId = import.meta.env.VITE_CLIENT_ID as string;
  const callbackUri = "https://www.cloudshop.click/auth/callback";
  const homeUri = "https://www.cloudshop.click/";

  const loginRedirect = () => {
    const url =
      `${cognitoDomain}/login` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&redirect_uri=${encodeURIComponent(callbackUri)}`;
    window.location.href = url;
  };

  const logoutRedirect = () => {
    const url =
      `${cognitoDomain}/logout` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&logout_uri=${encodeURIComponent(homeUri)}`;
    window.location.href = url;
  };

  return (
    <>
      <nav className="w-full bg-black text-white fixed top-0 left-0 z-50 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-8 py-3 gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="text-lg font-bold">
              <a href={homeUri}>CloudShop</a>
            </div>
            <div className="md:hidden">
              <button onClick={() => dispatch(toggleCart())}>
                {isCartOpen ? <X /> : <Menu />}
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
            <Button value="Sign Up" type={ButtonType.Secondary} onClick={loginRedirect} />
            <Button value="Log in" type={ButtonType.Secondary} onClick={loginRedirect} />
            <button onClick={() => dispatch(openCart())} className="p-2">
              <ShoppingCartIcon />
            </button>
            <Button value="Log out" type={ButtonType.Secondary} onClick={logoutRedirect} />
          </div>
        </div>

        {isCartOpen && (
          <div className="md:hidden flex flex-col items-end gap-2 px-4 pb-4">
            <Button value="Sign Up" type={ButtonType.Secondary} onClick={loginRedirect} />
            <Button value="Log in" type={ButtonType.Secondary} onClick={loginRedirect} />
            <button onClick={() => dispatch(openCart())} className="p-2">
              <ShoppingCartIcon />
            </button>
            <Button value="Log out" type={ButtonType.Secondary} onClick={logoutRedirect} />
          </div>
        )}
      </nav>

      {isCartOpen && <Cart onClose={() => dispatch(closeCart())} />}
    </>
  );
}

export { Navbar };
