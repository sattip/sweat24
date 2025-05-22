
import React from "react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium ${location.pathname === "/dashboard" ? "text-primary" : "hover:text-primary"}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/schedule" 
            className={`text-sm font-medium ${location.pathname.includes("/schedule") || location.pathname.includes("/class") ? "text-primary" : "hover:text-primary"}`}
          >
            Schedule
          </Link>
          <Link 
            to="/profile" 
            className={`text-sm font-medium ${location.pathname === "/profile" ? "text-primary" : "hover:text-primary"}`}
          >
            Profile
          </Link>
          <Link 
            to="/trainers" 
            className="text-sm font-medium hover:text-primary"
          >
            Trainers
          </Link>
          <Link 
            to="/store" 
            className="text-sm font-medium hover:text-primary"
          >
            Store
          </Link>
        </nav>
        <div className="flex items-center space-x-3">
          <Link to="/profile">
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
