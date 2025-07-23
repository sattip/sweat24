
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
    if (path === "/bookings" || path === "/history") return "Οι Κρατήσεις μου";
    if (path === "/progress" || path === "/progress-photos" || path === "/body-measurements") return "Έλεγχος Προόδου";
    if (path === "/services") return "Personal & EMS";
    if (path.includes("/services/request")) return "Αίτηση Ραντεβού";
    if (path === "/services/confirmation") return "Επιβεβαίωση Ραντεβού";
    if (path === "/rewards") return "Πρόγραμμα Ανταμοιβής";
    if (path === "/referrals") return "Πρόγραμμα Συστάσεων";
    if (path === "/partners") return "Συνεργαζόμενες Επιχειρήσεις";
    if (path === "/events") return "Εκδηλώσεις";
    if (path === "/store") return "Κατάστημα";
    if (path === "/order-history") return "Ιστορικό Παραγγελιών";
    if (path === "/contact") return "Επικοινωνία";
    if (path === "/profile") return "Προφίλ";
    if (path === "/settings") return "Ρυθμίσεις";
    return "Sweat93";
  };

  return (
    <div className={`font-medium ml-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
      {getPageTitle()}
    </div>
  );
};

export default PageTitle;
