
import React from "react";
import { useLocation } from "react-router-dom";

const PageTitle: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/schedule") || path.includes("/class")) return "Schedule";
    if (path === "/bookings") return "My Bookings";
    if (path === "/history") return "Workout History";
    if (path === "/progress-photos") return "Progress Photos";
    if (path === "/body-measurements") return "Body Measurements";
    if (path === "/services") return "Specialized Services";
    if (path.includes("/services/request")) return "Request Appointment";
    if (path === "/services/confirmation") return "Appointment Confirmation";
    if (path === "/trainers") return "Trainers";
    if (path.includes("/trainers/")) return "Trainer Profile";
    if (path === "/store") return "Store";
    if (path === "/referrals") return "Referral Program";
    if (path === "/profile") return "Profile";
    if (path === "/settings") return "Settings";
    if (path === "/contact") return "Contact Us";
    return "Sweat24";
  };

  return <div className="font-medium ml-2">{getPageTitle()}</div>;
};

export default PageTitle;
