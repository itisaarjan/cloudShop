import Button, { ButtonType } from "./Button";

function Navbar() {
  return (
    <nav className="w-full bg-black text-white fixed top-0 left-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 h-auto min-h-[8vh] flex items-center justify-between gap-4 flex-wrap py-2">
        
        
        <div className="text-lg font-bold">MyShop</div>

        
        <form className="max-w-md w-full flex-1 flex gap-2">
  <input
    type="search"
    id="default-search"
    className="block w-full p-2 text-sm text-white border border-gray-600 rounded-lg bg-gray-800 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-0">
          <Button type={ButtonType.Secondary} value="Sign Up" />
          <Button type={ButtonType.Secondary} value="Log In" />
        </div>
      </div>
    </nav>
  );
}

export { Navbar };
