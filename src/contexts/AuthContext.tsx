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
    console.log('🔍 AUTH DEBUG:', {
      user: user,
      status: user?.status,
      has_signed_terms: user?.has_signed_terms,
      condition1: user && user.status === 'active',
      condition2: !user?.has_signed_terms,
      finalCondition: user && user.status === 'active' && !user?.has_signed_terms
    });

    if (user && user.status === 'active' && !user?.has_signed_terms) {
      // Always show modal for users who haven't signed terms in backend
      // Session storage is unreliable for critical functions
      console.log('🚀 SHOWING MODAL for user', user.id, '- has_signed_terms:', user.has_signed_terms);
      setShowPendingModal(true);
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
    console.log('🚀 SIGNATURE SAVE CALLED for user:', user?.id);
    console.log('🚀 Signature data length:', signatureData?.length);
    
    try {
      // Save signature to backend
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 User exists:', !!user);
      
      if (!token || !user) {
        throw new Error('No authentication token or user');
      }

      const requestPayload = {
        user_id: user.id,
        signature_data: signatureData,
        document_type: 'terms_and_conditions',
        document_version: '1.0',
      };
      
      console.log('🚀 SENDING REQUEST to /api/v1/signatures');
      console.log('🚀 Request payload:', {
        user_id: requestPayload.user_id,
        signature_data_length: signatureData.length,
        document_type: requestPayload.document_type
      });

      const response = await fetch('https://sweat93laravel.obs.com.gr/api/v1/signatures', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('🚀 RESPONSE STATUS:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to save signature:', errorText);
        throw new Error('Failed to save signature');
      }

      const responseData = await response.json();
      console.log('✅ Signature saved successfully:', responseData);

      // Close modal and refresh user data to get updated has_signed_terms
      setShowPendingModal(false);
      await refreshUser(); // Refresh user data from backend
      toast.success('Η υπογραφή σας καταχωρήθηκε επιτυχώς! Μπορείτε τώρα να χρησιμοποιήσετε την εφαρμογή.');
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