import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useStatusBar } from "@/hooks/useStatusBar";
import { useMobileKeyboardFix } from "@/hooks/use-keyboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SignupSuccessPage from "./pages/SignupSuccessPage";
import DashboardPage from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ClassSchedulePage from "./pages/ClassSchedulePage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import BookingsPage from "./pages/BookingsPage";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage";
import WorkoutDetailsPage from "./pages/WorkoutDetailsPage";
import ProgressPhotosPage from "./pages/ProgressPhotosPage";
import BodyMeasurementsPage from "./pages/BodyMeasurementsPage";
import ProgressPage from "./pages/ProgressPage";
import RewardsPage from "./pages/RewardsPage";
import NotFound from "./pages/NotFound";
import SpecializedServicesPage from "./pages/SpecializedServicesPage";
import AppointmentRequestPage from "./pages/AppointmentRequestPage";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import StorePage from "./pages/StorePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ReferralProgramPage from "./pages/ReferralProgramPage";
import TrainersListPage from "./pages/TrainersListPage";
import TrainerDetailsPage from "./pages/TrainerDetailsPage";
import SettingsPage from "./pages/SettingsPage";
import ContactPage from "./pages/ContactPage";
import PartnersPage from "./pages/PartnersPage";
import EventsPage from "./pages/EventsPage";
import EvaluationPage from "./pages/EvaluationPage";
import { CartProvider } from "./hooks/use-cart";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatWidget } from "./components/chat/ChatWidget";
import { NotificationManager } from "./components/notifications/NotificationManager";

const queryClient = new QueryClient();

function BackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Apply mobile keyboard fixes
  useMobileKeyboardFix();

  useEffect(() => {
    // Android back gesture / hardware back button
    let handle: any = null;
    const setup = async () => {
      try {
        handle = await CapacitorApp.addListener("backButton", () => {
          if (location.pathname === "/dashboard") {
            CapacitorApp.exitApp();
          } else {
            navigate(-1);
          }
        });
      } catch (err) {
        // noop
      }
    };
    void setup();

    return () => {
      try {
        handle?.remove?.();
      } catch {}
    };
  }, [location.pathname, navigate]);

  return null;
}

const App = () => {
  useStatusBar();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BackButtonHandler />
            <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup-success" element={<SignupSuccessPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><ClassSchedulePage /></ProtectedRoute>} />
            <Route path="/class/:classId" element={<ProtectedRoute><ClassDetailsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* Updated bookings route - now includes history */}
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/history" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/workout/:workoutId" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
            
            {/* New unified progress route */}
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/progress-photos" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/body-measurements" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            
            {/* Renamed from Specialized Services to Personal & EMS */}
            <Route path="/services" element={<ProtectedRoute><SpecializedServicesPage /></ProtectedRoute>} />
            <Route path="/services/request/:serviceId" element={<ProtectedRoute><AppointmentRequestPage /></ProtectedRoute>} />
            <Route path="/services/confirmation" element={<ProtectedRoute><AppointmentConfirmationPage /></ProtectedRoute>} />
            
            {/* New rewards program */}
            <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
            
            {/* Store routes */}
            <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
            <Route path="/product/:productId" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/order-history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            
            {/* Renamed from Referral Program to Suggestion Program */}
            <Route path="/referrals" element={<ProtectedRoute><ReferralProgramPage /></ProtectedRoute>} />
            
            {/* Removed trainers routes as requested */}
            {/* <Route path="/trainers" element={<ProtectedRoute><TrainersListPage /></ProtectedRoute>} />
            <Route path="/trainers/:trainerId" element={<ProtectedRoute><TrainerDetailsPage /></ProtectedRoute>} /> */}
            
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
            <Route path="/partners" element={<ProtectedRoute><PartnersPage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/evaluation/:token" element={<EvaluationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
          <NotificationManager />
        </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
