
import React, { useState } from "react";
import Logo from "../Logo";
import { Button } from "../ui/button";
import { Menu, User, Contact } from "lucide-react";
import { Link } from "react-router-dom";
import MobileNavigation from "./MobileNavigation";
import PageTitle from "./PageTitle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "../ui/sheet";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  
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
          <PageTitle />
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/contact">
            <Button variant="ghost" size="icon">
              <Contact className="h-5 w-5" />
              <span className="sr-only">Contact Us</span>
            </Button>
          </Link>
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
