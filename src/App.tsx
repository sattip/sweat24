import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
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
import ReferralProgramPage from "./pages/ReferralProgramPage";
import TrainersListPage from "./pages/TrainersListPage";
import TrainerDetailsPage from "./pages/TrainerDetailsPage";
import SettingsPage from "./pages/SettingsPage";
import ContactPage from "./pages/ContactPage";
import PartnersPage from "./pages/PartnersPage";
import EventsPage from "./pages/EventsPage";
import { CartProvider } from "./hooks/use-cart";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schedule" element={<ClassSchedulePage />} />
            <Route path="/class/:classId" element={<ClassDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/history" element={<WorkoutHistoryPage />} />
            <Route path="/workout/:workoutId" element={<WorkoutDetailsPage />} />
            <Route path="/progress-photos" element={<ProgressPhotosPage />} />
            <Route path="/body-measurements" element={<BodyMeasurementsPage />} />
            <Route path="/services" element={<SpecializedServicesPage />} />
            <Route path="/services/request/:serviceId" element={<AppointmentRequestPage />} />
            <Route path="/services/confirmation" element={<AppointmentConfirmationPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/product/:productId" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/referrals" element={<ReferralProgramPage />} />
            <Route path="/trainers" element={<TrainersListPage />} />
            <Route path="/trainers/:trainerId" element={<TrainerDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
