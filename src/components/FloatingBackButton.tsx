import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingBackButtonProps {
  position?: 'left' | 'right';
}

export const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({
  position = 'left'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on dashboard/home and public pages
  const hideOnPaths = ['/dashboard', '/', '/login', '/signup', '/signup-success'];
  const shouldHide = hideOnPaths.includes(location.pathname) ||
                     location.pathname.startsWith('/evaluation');

  if (shouldHide) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate(-1)}
      className={cn(
        "fixed h-12 w-12 rounded-full shadow-lg z-40 touch-manipulation",
        "bg-gray-800 hover:bg-gray-700 text-white",
        position === 'left' ? "left-4" : "right-4"
      )}
      style={{
        bottom: 'max(20px, calc(env(safe-area-inset-bottom) + 16px))'
      }}
      size="icon"
    >
      <ChevronLeft className="h-6 w-6" />
      <span className="sr-only">Πίσω</span>
    </Button>
  );
};
