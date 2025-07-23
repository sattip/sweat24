import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Grid2X2,
  Users,
  Calendar,
  Book,
  User,
  Package,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Euro,
  Activity,
  CreditCard,
  FileText,
  TrendingUp,
  Briefcase,
  Gift,
  Building2,
  CalendarDays,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "./Logo";

const adminNavigationItems = [
  { title: "Πίνακας Ελέγχου", url: "/", icon: Grid2X2 },
  { title: "Πελάτες", url: "/users", icon: Users },
  { title: "Μαθήματα & Προγραμματισμός", url: "/classes", icon: Calendar },
  { title: "Κρατήσεις & Παρουσίες", url: "/bookings", icon: Book },
  { title: "Προπονητές", url: "/trainers", icon: User },
  { title: "Κατάστημα", url: "/store", icon: Package },
  { title: "Πακέτα", url: "/packages", icon: Package },
  { title: "Ειδοποιήσεις", url: "/notifications", icon: Bell },
  { title: "Πληρωμές & Δόσεις", url: "/payments", icon: CreditCard },
  { title: "Ταμείο", url: "/cash-register", icon: Euro },
  { title: "Έξοδα Επιχείρησης", url: "/expenses", icon: FileText },
  { title: "Οικονομικές Αναφορές", url: "/reports", icon: TrendingUp },
  { title: "Αξιολόγηση & Πρόοδος", url: "/assessment", icon: Activity },
  { title: "Εξειδικευμένες Υπηρεσίες", url: "/specialized-services", icon: Briefcase },
  { title: "Προγράμματα & Ανταμοιβές", url: "/referral-program", icon: Gift },
  { title: "Συνεργάτες", url: "/partners", icon: Building2 },
  { title: "Εκδηλώσεις", url: "/events", icon: CalendarDays },
  { title: "Ρυθμίσεις", url: "/settings", icon: Settings },
];

const trainerNavigationItems = [
  { title: "Πίνακας Ελέγχου", url: "/", icon: Grid2X2 },
  { title: "Πελάτες", url: "/users", icon: Users },
  { title: "Μαθήματα & Προγραμματισμός", url: "/classes", icon: Calendar },
  { title: "Κρατήσεις & Παρουσίες", url: "/bookings", icon: Book },
  { title: "Πακέτα", url: "/packages", icon: Package },
  { title: "Ειδοποιήσεις", url: "/notifications", icon: Bell },
  { title: "Ταμείο", url: "/cash-register", icon: Euro },
  { title: "Αξιολόγηση & Πρόοδος", url: "/assessment", icon: Activity },
  { title: "Ρυθμίσεις", url: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state, open } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  
  // Determine navigation items based on user role
  const navigationItems = user?.role === 'trainer' ? trainerNavigationItems : adminNavigationItems;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const baseClasses =
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 w-full";
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground shadow-sm`;
    }
    return `${baseClasses} text-foreground hover:bg-accent hover:text-accent-foreground`;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-sidebar`}
      collapsible="icon"
      data-oid="cjavhx9"
    >
      <div
        className="flex h-16 items-center justify-center border-b bg-sidebar px-4"
        data-oid="4o5fj44"
      >
        <Logo />
      </div>

      <SidebarContent className="p-4 bg-sidebar" data-oid="hhj:xol">
        <SidebarGroup data-oid="ikd9x0p">
          <SidebarGroupLabel
            className={`mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${collapsed ? "hidden" : ""}`}
            data-oid="qqw8x08"
          >
            Διαχείριση
          </SidebarGroupLabel>
          <SidebarGroupContent data-oid="gw7x6.q">
            <SidebarMenu className="space-y-2" data-oid="r:g1yx1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title} data-oid="9_w8sqf">
                  {/* Αντικαθιστώ το SidebarMenuButton με απλό NavLink για πλήρη έλεγχο */}
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className={getNavClassName(item.url)}
                    title={collapsed ? item.title : undefined}
                    data-oid="f84d6vc"
                  >
                    <item.icon
                      className="h-5 w-5 flex-shrink-0"
                      data-oid="i6hs.:_"
                    />

                    {!collapsed && <span data-oid="4cnju1i">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div
        className="absolute bottom-4 left-4 right-4 bg-sidebar"
        data-oid="6l-.sg-"
      >
        <SidebarTrigger
          className="w-full flex items-center justify-center p-2 rounded-md bg-muted hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
          data-oid="2tlhq16"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" data-oid="vy0z3vd" />
          ) : (
            <ChevronLeft className="h-4 w-4" data-oid="mmfhzlf" />
          )}
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
}
