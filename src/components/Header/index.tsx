
import React, { useState } from "react";
import Logo from "../Logo";
import { Button } from "../ui/button";
import { Menu, ShoppingCart, ChevronLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MobileNavigation from "./MobileNavigation";
import { NotificationBell } from "../notifications/NotificationBell";
import { useCart } from "@/hooks/use-cart";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "../ui/sheet";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show back button on dashboard or home page
  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/';
  
  return (
    <header
      className="bg-white border-b sticky top-0 z-10"
      style={{
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        minHeight: 'calc(56px + max(8px, env(safe-area-inset-top)))'
      }}
    >
      <div className="container relative flex h-14 md:h-14 items-center justify-between px-3 md:px-4 max-w-7xl mx-auto">
        {/* Left section: Menu + Back button */}
        <div className="flex items-center gap-2 shrink-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 touch-manipulation">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Εναλλαγή μενού</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Μενού Πλοήγησης</SheetTitle>
                <SheetDescription>
                  Επιλέξτε μια σελίδα για να μεταβείτε
                </SheetDescription>
              </SheetHeader>
              <MobileNavigation />
              <SheetClose className="absolute right-4 top-4" />
            </SheetContent>
          </Sheet>

          {/* Back button for mobile - right of menu */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:hidden shrink-0 touch-manipulation"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Πίσω</span>
            </Button>
          )}
        </div>

        {/* Center section: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          <Logo to="/dashboard" className="shrink-0" />
        </div>

        {/* Right section: Notifications + Cart */}
        <div className="flex items-center gap-1 shrink-0">
          <NotificationBell />

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 touch-manipulation">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full text-[10px] h-4 w-4 flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="sr-only">Καλάθι αγορών</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
