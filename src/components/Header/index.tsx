
import React, { useState, useEffect } from "react";
import Logo from "../Logo";
import { Button } from "../ui/button";
import { Menu, X, User, Contact, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNavigation from "./MobileNavigation";
import PageTitle from "./PageTitle";
import { NotificationBell } from "../notifications/NotificationBell";
import { useCart } from "@/hooks/use-cart";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  
  useEffect(() => {
    const handleCloseSheet = () => setOpen(false);
    document.addEventListener('close-sheet', handleCloseSheet);
    return () => document.removeEventListener('close-sheet', handleCloseSheet);
  }, []);
  
  return (
    <>
      <header className="bg-white border-b sticky top-0 z-10 pt-safe">
        <div className="container flex h-16 md:h-16 items-center justify-between px-3 md:px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 md:h-10 md:w-10 shrink-0 touch-manipulation"
              onClick={() => setOpen(!open)}
            >
              <Menu className="h-5 w-5 md:h-5 md:w-5" />
              <span className="sr-only">Εναλλαγή μενού</span>
            </Button>
          <Link to="/dashboard" className="flex items-center shrink-0">
            <Logo />
          </Link>
          <div className="min-w-0 flex-1">
            <PageTitle />
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <NotificationBell />
          
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 md:h-10 md:w-10 touch-manipulation">
              <ShoppingCart className="h-5 w-5 md:h-5 md:w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-primary text-primary-foreground rounded-full text-xs h-5 w-5 md:h-5 md:w-5 flex items-center justify-center font-medium min-w-[20px]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="sr-only">Καλάθι αγορών</span>
            </Button>
          </Link>
          
          <Link to="/contact">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-10 md:w-10 touch-manipulation">
              <Contact className="h-5 w-5 md:h-5 md:w-5" />
              <span className="sr-only">Επικοινωνία</span>
            </Button>
          </Link>
          
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-10 md:w-10 touch-manipulation">
              <User className="h-5 w-5 md:h-5 md:w-5" />
              <span className="sr-only">Προφίλ χρήστη</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
    
    {/* Mobile Menu Overlay */}
    {open && (
      <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setOpen(false)}>
        <div 
          className="absolute left-0 top-0 h-full w-[280px] sm:w-[300px] bg-background shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Μενού</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <MobileNavigation onNavigate={() => setOpen(false)} />
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
