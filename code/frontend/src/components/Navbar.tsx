import { useState } from "react";
import Button, { ButtonType } from "./Button";
import { ShoppingCartIcon } from "./ShoppingCartIcon";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="w-full bg-black text-white sticky top-0 left-0 z-50 shadow">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-8 py-3 gap-2 md:gap-0">
      
      {/* Top Row: Logo + Hamburger */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="text-lg font-bold">
          <a href="https://www.cloudshop.click">CloudShop</a>
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={toggleNavbar}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
  
      {/* Search Bar */}
      <div className="w-full md:w-1/3">
        <input
          type="search"
          className="w-full p-2 text-sm text-white border border-gray-600 rounded-lg bg-gray-800 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search products..."
          required
        />
      </div>
  
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        <Button value="Sign Up" type={ButtonType.Secondary} />
        <Button value="Log in" type={ButtonType.Secondary} />
        <ShoppingCartIcon />
      </div>
    </div>
  
    {/* Mobile Menu */}
    {isOpen && (
      <div className="md:hidden flex flex-col items-end gap-2 px-4 pb-4">
        <Button value="Sign Up" type={ButtonType.Secondary} />
        <Button value="Log in" type={ButtonType.Secondary} />
        <ShoppingCartIcon />
      </div>
    )}
  </nav>
  
  );
}

export { Navbar };
