
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
import ProgressPhotosPage from "./pages/ProgressPhotosPage";
import BodyMeasurementsPage from "./pages/BodyMeasurementsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          <Route path="/progress-photos" element={<ProgressPhotosPage />} />
          <Route path="/body-measurements" element={<BodyMeasurementsPage />} />
          <Route path="/trainers" element={<NotFound />} /> {/* Placeholder until implemented */}
          <Route path="/store" element={<NotFound />} /> {/* Placeholder until implemented */}
          <Route path="/settings" element={<NotFound />} /> {/* Placeholder until implemented */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
