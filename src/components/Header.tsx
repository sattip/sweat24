import React, { useState } from "react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Menu, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const MobileNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.includes(path);
  };

  return (
    <div className="flex flex-col gap-2 p-4 h-full">
      <div className="border-b pb-4 mb-2">
        <Link to="/profile" className="flex items-center gap-4 p-2 rounded-md hover:bg-accent">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-muted-foreground">View Profile</p>
          </div>
        </Link>
      </div>
      
      <nav className="space-y-1">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/dashboard") ? "bg-primary text-white font-medium" : "hover:bg-accent/50"
          )}
        >
          Dashboard
        </Link>
        <Link 
          to="/schedule" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/schedule") || isActive("/class") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          Schedule
        </Link>
        <Link 
          to="/bookings" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/bookings") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          My Bookings
        </Link>
        <Link 
          to="/history" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/history") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          Workout History
        </Link>
        <Link 
          to="/progress-photos" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/progress-photos") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          Progress Photos
        </Link>
        <Link 
          to="/body-measurements" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/body-measurements") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          Body Measurements
        </Link>
        <Link 
          to="/services" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/services") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          Specialized Services
        </Link>
        <Link 
          to="/referrals" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/referrals") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          Referral Program
        </Link>
        <Link 
          to="/trainers" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/trainers") ? "bg-accent font-medium" : "hover:bg-accent/50"
          )}
        >
          Trainers
        </Link>
        <Link 
          to="/store" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/store") 
              ? "bg-accent font-medium" 
              : "hover:bg-accent/50"
          )}
        >
          <span className="border-2 border-purple-500 px-2 py-0.5 rounded">Store</span>
        </Link>
      </nav>

      <div className="border-t mt-4 pt-4 mt-auto">
        <Link 
          to="/settings" 
          className="flex items-center gap-3 p-2 text-sm rounded-md hover:bg-accent/50"
        >
          Settings
        </Link>
        <Link 
          to="/" 
          className="flex items-center gap-3 p-2 text-sm rounded-md text-destructive hover:bg-accent/50"
        >
          Logout
        </Link>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/schedule") || path.includes("/class")) return "Schedule";
    if (path === "/bookings") return "My Bookings";
    if (path === "/history") return "Workout History";
    if (path === "/progress-photos") return "Progress Photos";
    if (path === "/body-measurements") return "Body Measurements";
    if (path === "/services") return "Specialized Services";
    if (path.includes("/services/request")) return "Request Appointment";
    if (path === "/services/confirmation") return "Appointment Confirmation";
    if (path === "/trainers") return "Trainers";
    if (path === "/store") return "Store";
    if (path === "/referrals") return "Referral Program";
    if (path === "/profile") return "Profile";
    if (path === "/settings") return "Settings";
    return "Sweat24";
  };
  
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:flex">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] p-0">
              <MobileNavigation />
              <SheetClose className="absolute right-4 top-4" />
            </SheetContent>
          </Sheet>
          <Link to="/dashboard" className="flex items-center">
            <Logo />
          </Link>
          <div className="font-medium ml-2">{getPageTitle()}</div>
        </div>
        
        <div className="flex items-center">
          <Link to="/profile">
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
