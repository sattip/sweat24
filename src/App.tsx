import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup-success" element={<SignupSuccessPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><ClassSchedulePage /></ProtectedRoute>} />
            <Route path="/class/:classId" element={<ProtectedRoute><ClassDetailsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><WorkoutHistoryPage /></ProtectedRoute>} />
            <Route path="/workout/:workoutId" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
            <Route path="/progress-photos" element={<ProtectedRoute><ProgressPhotosPage /></ProtectedRoute>} />
            <Route path="/body-measurements" element={<ProtectedRoute><BodyMeasurementsPage /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><SpecializedServicesPage /></ProtectedRoute>} />
            <Route path="/services/request/:serviceId" element={<ProtectedRoute><AppointmentRequestPage /></ProtectedRoute>} />
            <Route path="/services/confirmation" element={<ProtectedRoute><AppointmentConfirmationPage /></ProtectedRoute>} />
            <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
            <Route path="/product/:productId" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/referrals" element={<ProtectedRoute><ReferralProgramPage /></ProtectedRoute>} />
            <Route path="/trainers" element={<ProtectedRoute><TrainersListPage /></ProtectedRoute>} />
            <Route path="/trainers/:trainerId" element={<ProtectedRoute><TrainerDetailsPage /></ProtectedRoute>} />
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

export default App;
