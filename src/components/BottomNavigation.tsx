import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Store, User, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Αρχική',
    },
    {
      path: '/bookings',
      icon: Calendar,
      label: 'Κρατήσεις',
    },
    {
      path: '/store',
      icon: Store,
      label: 'Κατάστημα',
    },
    {
      path: '/questionnaires',
      icon: ClipboardList,
      label: 'Ερωτηματολόγια',
    },
    {
      path: '/profile',
      icon: User,
      label: 'Προφίλ',
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 pb-safe-ios" />

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe-ios shadow-lg">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1", active && "fill-current")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};
