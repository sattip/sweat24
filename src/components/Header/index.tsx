
import React, { useState } from "react";
import Logo from "../Logo";
import { Button } from "../ui/button";
import { Menu, User, Contact, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNavigation from "./MobileNavigation";
import PageTitle from "./PageTitle";
import { NotificationBell } from "../NotificationBell";
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
  
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:flex">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Εναλλαγή μενού</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] p-0">
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
          <Link to="/dashboard" className="flex items-center">
            <Logo />
          </Link>
          <PageTitle />
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link to="/cart">
            <Button variant="destructive" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white text-destructive text-xs font-bold flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="sr-only">Καλάθι ({itemCount} προϊόντα)</span>
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="icon">
              <Contact className="h-5 w-5" />
              <span className="sr-only">Επικοινωνία</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Προφίλ</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
