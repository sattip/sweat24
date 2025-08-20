import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/services/authService';
import { pusherService } from '@/services/pusherService';
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
    } else if (user && user.status === 'active' && user?.has_signed_terms) {
      // Hide modal when user has signed terms
      console.log('✅ HIDING MODAL - user has signed terms:', user.has_signed_terms);
      setShowPendingModal(false);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        // Φόρτωση άμεσα από localStorage για γρήγορο render
        const storedUser = authService.getStoredUser();
        if (storedUser) setUser(storedUser);

        // ΠΑΝΤΑ φέρνουμε φρέσκα στοιχεία από backend στο background
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
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
    // Αμέσως μετά το login, φέρε φρέσκο user από backend (για πακέτα κ.λπ.)
    await refreshUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    // Disconnect Pusher when logging out
    pusherService.disconnect();
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }

      // Make actual API call to get fresh user data from backend
      const response = await fetch('https://sweat93laravel.obs.com.gr/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to refresh user data');
        // If refresh fails, keep current user but don't clear auth
        return;
      }

      const data = await response.json();
      console.log('🔄 FRESH USER DATA from backend:', data);
      
      if (data.success && data.user) {
        let updatedUser = data.user;
        
        // Backend already sends full URL for avatar, no need to modify it
        console.log('📸 Avatar from backend:', updatedUser.avatar);

        // Fallback: αν δεν υπάρχουν aggregates για πακέτο, προσπάθησε να τα αντλήσεις από /users/{id}
        const needsPackageDerive =
          updatedUser?.remaining_sessions === 0 ||
          (updatedUser?.remaining_sessions === undefined && !updatedUser?.package_end_date);

        if (needsPackageDerive) {
          try {
            const detailsResp = await fetch(`https://sweat93laravel.obs.com.gr/api/v1/users/${updatedUser.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });
            if (detailsResp.ok) {
              const detailsData = await detailsResp.json();
              const userDetails = detailsData?.user || detailsData;
              const activePkg =
                userDetails?.active_package ||
                userDetails?.current_package ||
                (Array.isArray(userDetails?.user_packages)
                  ? userDetails.user_packages.find((p: any) => p?.status === 'active')
                  : undefined);

              if (activePkg) {
                updatedUser = {
                  ...updatedUser,
                  remaining_sessions:
                    activePkg.remaining_sessions !== undefined ? activePkg.remaining_sessions : null,
                  total_sessions: activePkg.total_sessions ?? updatedUser.total_sessions,
                  membership_type:
                    activePkg?.package?.name || activePkg?.package_name || updatedUser.membership_type,
                  package_start_date: activePkg.starts_at || activePkg.assigned_at || updatedUser.package_start_date,
                  package_end_date: activePkg.expires_at || updatedUser.package_end_date,
                };
              }
            }
          } catch (e) {
            // ignore fallback errors
          }
        }

        // Store and set
        localStorage.setItem('sweat24_user', JSON.stringify(updatedUser));
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('✅ User refreshed - has_signed_terms:', data.user.has_signed_terms);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Don't clear auth on network error, just keep current user
    }
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

      // Refresh user data to get updated has_signed_terms from backend
      await refreshUser();
      
      // Modal will close automatically when user.has_signed_terms becomes true
      // No need to manually setShowPendingModal(false) here
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