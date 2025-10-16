import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  // Double-check authentication with fallback to localStorage
  const hasToken = !!localStorage.getItem('auth_token');
  const hasStoredUser = !!localStorage.getItem('sweat93_user');
  const isActuallyAuthenticated = isAuthenticated || hasToken || hasStoredUser;

  if (!isActuallyAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};