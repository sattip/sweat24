import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/services/authService';
import { PendingUserModal } from '@/components/modals/PendingUserModal';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  useEffect(() => {
    // Show modal only for approved users who haven't signed terms
    if (user && user.status === 'active' && !user.has_signed_terms) {
      // Check if user has already signed terms during this session
      const hasSignedThisSession = sessionStorage.getItem(`signed_terms_${user.id}`);
      if (!hasSignedThisSession) {
        setShowPendingModal(true);
      }
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        // First try synchronous method for immediate load
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Fallback to async method if needed
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handlePendingUserSignature = async (signatureData: string) => {
    try {
      // TODO: Save signature to backend
      console.log('Saving signature for pending user:', {
        userId: user?.id,
        signature: signatureData,
        signedAt: new Date().toISOString()
      });

      // Mark as signed for this session
      if (user) {
        sessionStorage.setItem(`signed_terms_${user.id}`, 'true');
      }

      setShowPendingModal(false);
      toast.success('Η υπογραφή σας καταχωρήθηκε! Θα ενημερωθείτε μόλις ενεργοποιηθεί ο λογαριασμός σας.');
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Σφάλμα κατά την αποθήκευση της υπογραφής');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Pending User Modal */}
      {user && showPendingModal && (
        <PendingUserModal
          isOpen={showPendingModal}
          onSignature={handlePendingUserSignature}
          userName={user.name}
        />
      )}
    </AuthContext.Provider>
  );
};