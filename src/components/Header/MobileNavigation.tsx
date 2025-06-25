import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "@/lib/utils";

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
            <AvatarFallback>ΧΡ</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Χρήστης</p>
            <p className="text-sm text-muted-foreground">Προβολή Προφίλ</p>
          </div>
        </Link>
      </div>
      
      <nav className="space-y-1">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/dashboard") ? "bg-primary text-white font-medium" : "hover:bg-accent/50 text-black"
          )}
        >
          Αρχική
        </Link>
        <Link 
          to="/schedule" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/schedule") || isActive("/class") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Πρόγραμμα
        </Link>
        <Link 
          to="/bookings" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/bookings") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Οι Κρατήσεις μου
        </Link>
        <Link 
          to="/history" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/history") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Ιστορικό Προπονήσεων
        </Link>
        <Link 
          to="/progress-photos" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/progress-photos") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Φωτογραφίες Προόδου
        </Link>
        <Link 
          to="/body-measurements" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/body-measurements") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Σωματικές Μετρήσεις
        </Link>
        <Link 
          to="/services" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/services") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Εξειδικευμένες Υπηρεσίες
        </Link>
        <Link 
          to="/trainers" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/trainers") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Προπονητές
        </Link>
        <Link 
          to="/referrals" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/referrals") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Πρόγραμμα Παραπομπών
        </Link>
        <Link 
          to="/partners" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/partners") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Συνεργαζόμενες Επιχειρήσεις
        </Link>
        <Link 
          to="/events" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/events") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Εκδηλώσεις
        </Link>
        <Link 
          to="/store" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/store") 
              ? "bg-accent font-medium text-white" 
              : "hover:bg-accent/50 text-black"
          )}
        >
          <span className={cn(
            "px-2 py-0.5 rounded border-2", 
            isActive("/store") ? "border-white" : "border-primary"
          )}>Κατάστημα</span>
        </Link>
        <Link 
          to="/contact" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/contact") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Επικοινωνία
        </Link>
      </nav>

      <div className="border-t mt-4 pt-4 mt-auto">
        <Link 
          to="/settings" 
          className={cn(
            "flex items-center gap-3 p-2 text-sm rounded-md",
            isActive("/settings") ? "bg-accent font-medium text-white" : "hover:bg-accent/50 text-black"
          )}
        >
          Ρυθμίσεις
        </Link>
        <Link 
          to="/" 
          className="flex items-center gap-3 p-2 text-sm rounded-md text-destructive hover:bg-accent/50"
        >
          Αποσύνδεση
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;
