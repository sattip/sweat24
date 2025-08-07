import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.includes(path);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/';

  return (
    <div className="flex flex-col h-full bg-background pt-safe-ios">
      {/* iOS-style Back Navigation */}
      {showBackButton && (
        <div className="flex items-center px-4 py-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto font-normal text-primary hover:bg-transparent"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="text-base">Πίσω</span>
          </Button>
        </div>
      )}
      
      {/* User Profile Section */}
      <div className="p-3 sm:p-4 border-b bg-muted/20">
        <Link to="/profile" className="flex items-center gap-3 p-3 sm:p-3 rounded-lg hover:bg-background transition-colors touch-manipulation">
          <Avatar className="h-10 w-10 sm:h-10 sm:w-10">
            <AvatarFallback className="text-sm font-medium">
              {user?.name?.substring(0, 2).toUpperCase() || 'ΧΡ'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.name || 'Χρήστης'}</p>
            <p className="text-xs text-muted-foreground">Προβολή Προφίλ</p>
          </div>
        </Link>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/dashboard") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Αρχική
        </Link>
        
        <Link 
          to="/bookings" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/bookings") || isActive("/history") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Οι Κρατήσεις μου
        </Link>
        
        <Link 
          to="/services" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/services") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Personal & EMS
        </Link>
        
        <Link 
          to="/rewards" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/rewards") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span>Πρόγραμμα Ανταμοιβής</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              Σύντομα
            </span>
          </div>
        </Link>
        
        <Link 
          to="/referrals" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/referrals") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Πρόγραμμα Συστάσεων
        </Link>
        
        <Link 
          to="/progress" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/progress") || isActive("/progress-photos") || isActive("/body-measurements") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Έλεγχος Προόδου
        </Link>
        
        <Separator className="my-3" />
        
        <Link 
          to="/partners" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/partners") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Συνεργαζόμενες Επιχειρήσεις
        </Link>
        
        <Link 
          to="/events" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/events") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Εκδηλώσεις
        </Link>
        
        <Link 
          to="/store" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/store") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Κατάστημα
        </Link>
        
        <Link 
          to="/contact" 
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
            isActive("/contact") 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-muted/50 text-foreground"
          )}
        >
          Επικοινωνία
        </Link>
      </nav>

      {/* Logout Section */}
      <div className="p-3 sm:p-4 border-t bg-muted/20">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg hover:bg-background transition-colors text-destructive touch-manipulation"
        >
          Αποσύνδεση
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
