
import React from "react";
import Logo from "../Logo";
import { Button } from "../ui/button";
import { ShoppingCart, User, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationBell } from "../notifications/NotificationBell";
import { useCart } from "@/hooks/use-cart";

const Header: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <>
    <header
      className="bg-white border-b fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        minHeight: 'calc(56px + max(8px, env(safe-area-inset-top)))'
      }}
    >
      <div className="container relative flex h-14 md:h-14 items-center justify-between px-3 md:px-4 max-w-7xl mx-auto">
        {/* Left section: Profile + Cart */}
        <div className="flex items-center gap-1 shrink-0">
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="h-10 w-10 touch-manipulation">
              <User className="h-5 w-5" />
              <span className="sr-only">Προφίλ</span>
            </Button>
          </Link>

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

        {/* Center section: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          <Logo to="/dashboard" className="shrink-0" />
        </div>

        {/* Right section: Chat + Notifications */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 touch-manipulation"
            onClick={() => {
              // Dispatch custom event to open chat widget
              window.dispatchEvent(new CustomEvent('openChat'));
            }}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Συνομιλία</span>
          </Button>

          <NotificationBell />
        </div>
      </div>
    </header>
    {/* Spacer to account for fixed header */}
    <div style={{ height: 'calc(56px + max(8px, env(safe-area-inset-top)))' }} />
    </>
  );
};

export default Header;
