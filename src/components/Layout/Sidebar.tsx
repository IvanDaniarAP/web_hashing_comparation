import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  TestTube,
  Shield,
  History,
  Wallet,
  User,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logOut } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Zap, label: "Hashing Tests", path: "/dashboard/hashing" },
    { icon: BarChart3, label: "Performance", path: "/dashboard/performance" },
    { icon: Shield, label: "Security Tests", path: "/dashboard/security" },
    { icon: Wallet, label: "Wallet", path: "/dashboard/wallet" },
    { icon: History, label: "Transaction History", path: "/dashboard/history" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">StableCoin</h2>
            <p className="text-slate-400 text-sm">Hashing Platform</p>
          </div>
        </Link>
      </div>

      <nav className="mt-6 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "hover:bg-slate-700 hover:shadow-md"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={logOut}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 text-left hover:bg-red-600 transition-colors duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;