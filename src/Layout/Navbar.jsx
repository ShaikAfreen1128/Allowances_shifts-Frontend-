import { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Auth } from "../utils/auth";
import { LogOut } from "lucide-react"

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex justify-end items-center bg-white shadow px-4 py-2 relative z-100">
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {dropdownOpen && (
          <div className="absolute right-4 mt-2 z-50 px-4 py-3 bg-white">
  <button
    onClick={Auth.logout}
    className="flex items-center gap-2 text-neutral-700 px-4 py-2 cursor-pointer transition-all duration-200"
  >
    <LogOut size={18} />
    <span className="font-medium text-sm">Logout</span>
  </button>
</div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
