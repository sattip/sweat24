
import React from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const PageTitle: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Αρχική";
    if (path.includes("/schedule") || path.includes("/class")) return "Πρόγραμμα";
    if (path === "/bookings") return "Οι Κρατήσεις μου";
    if (path === "/history") return "Ιστορικό Προπονήσεων";
    if (path === "/progress-photos") return "Φωτογραφίες Προόδου";
    if (path === "/body-measurements") return "Σωματικές Μετρήσεις";
    if (path === "/services") return "Εξειδικευμένες Υπηρεσίες";
    if (path.includes("/services/request")) return "Αίτηση Ραντεβού";
    if (path === "/services/confirmation") return "Επιβεβαίωση Ραντεβού";
    if (path === "/trainers") return "Προπονητές";
    if (path.includes("/trainers/")) return "Προφίλ Προπονητή";
    if (path === "/store") return "Κατάστημα";
    if (path === "/referrals") return "Πρόγραμμα Παραπομπών";
    if (path === "/profile") return "Προφίλ";
    if (path === "/settings") return "Ρυθμίσεις";
    if (path === "/contact") return "Επικοινωνία";
    return "Sweat24";
  };

  return (
    <div className={`font-medium ml-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
      {getPageTitle()}
    </div>
  );
};

export default PageTitle;
