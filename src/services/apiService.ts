import { apiRequest, API_ENDPOINTS, buildApiUrl } from '@/config/api';

// Error handling helper function
const handleApiError = (error: Error, fallbackMessage = 'Κάτι πήγε στραβά'): string => {
  if (error.message.includes('401')) {
    return 'Παρακαλώ συνδεθείτε ξανά';
  }
  if (error.message.includes('404')) {
    return 'Δεν βρέθηκαν δεδομένα';
  }
  if (error.message.includes('500')) {
    return 'Πρόβλημα διακομιστή, προσπαθήστε αργότερα';
  }
  return fallbackMessage;
};

// Authentication
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(buildApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    if (data.success && data.user) {
      // Store BOTH user data AND auth token
      localStorage.setItem('sweat24_user', JSON.stringify(data.user));
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store auth token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      return data.user;
    }
    
    throw new Error('Login failed');
  },
  
  logout() {
    localStorage.removeItem('sweat24_user');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('sweat24_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('sweat24_user');
  }
};

// Classes
export const classService = {
  async getAll() {
    // Public endpoint - no authentication needed
    const response = await fetch(buildApiUrl('/classes'), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
  },

  async getById(id: string | number) {
    // Public endpoint - no authentication needed
    const response = await fetch(buildApiUrl(`/classes/${id}`), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch class');
    return response.json();
  }
};

// Bookings
export const bookingService = {
  async getUserBookings() {
    // Get user from localStorage
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) {
      return [];
    }
    
    const user = JSON.parse(userStr);
    
    // Use direct fetch with user_id parameter
    const url = buildApiUrl(`/bookings?user_id=${user.id}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.log('Failed to fetch user bookings, returning empty array');
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async getAll() {
    // Get user from localStorage
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) {
      return [];
    }
    
    const user = JSON.parse(userStr);
    
    // Use direct fetch with user_id parameter
    const url = buildApiUrl(`/bookings?user_id=${user.id}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      console.log('Failed to fetch all bookings, returning empty array');
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async create(data: any) {
    // Get user from localStorage and auth token
    const userStr = localStorage.getItem('sweat24_user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(userStr);
    
    // Add user_id to booking data
    const bookingData = {
      ...data,
      user_id: user.id
    };
    
    // Use direct fetch with authorization header
    const response = await fetch(buildApiUrl('/bookings'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create booking';
      
      try {
        const errorText = await response.text();
        console.log('🔍 Raw error response:', errorText);
        
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        console.log('🔍 Parsed error data:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.log('🔍 Error parsing response:', parseError);
        // Keep default message if can't parse
      }
      
      console.log('🔍 Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async checkIn(id: string | number) {
    const response = await apiRequest(API_ENDPOINTS.bookings.checkIn(id), {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to check in');
    return response.json();
  },

  async cancel(id: string | number, reason?: string) {
    // Get user and auth token
    const userStr = localStorage.getItem('sweat24_user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) throw new Error('Not authenticated');
    
    const user = JSON.parse(userStr);
    const response = await fetch(buildApiUrl(`/bookings/${id}/cancel`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        cancellation_reason: reason,
        user_id: user.id 
      }),
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
  },

  async reschedule(id: string | number, newClassId: string | number, reason?: string) {
    const userStr = localStorage.getItem('sweat24_user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) throw new Error('Not authenticated');
    
    const user = JSON.parse(userStr);
    const response = await fetch(buildApiUrl(`/bookings/${id}/reschedule`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        new_class_id: newClassId,
        reason: reason,
        user_id: user.id 
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reschedule booking');
    }
    return response.json();
  },

  async getUserPastBookings() {
    // Get user from localStorage (using the same pattern as other methods)
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) {
      console.log('No user found in localStorage');
      return [];
    }
    
    const user = JSON.parse(userStr);
    
    // Use the test-history endpoint without v1 version for this specific endpoint
    const response = await fetch(
      `https://sweat93laravel.obs.com.gr/api/test-history?user_id=${user.id}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.log('Failed to fetch past bookings, returning empty array');
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }
};

// Booking Requests
export const bookingRequestService = {
  async create(data: any) {
    // Get user from localStorage and auth token
    const userStr = localStorage.getItem('sweat24_user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(userStr);
    
    // Add user_id to booking request data
    const bookingRequestData = {
      ...data,
      user_id: user.id
    };
    
    // Use direct fetch with authorization header
    const response = await fetch(buildApiUrl('/booking-requests'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bookingRequestData),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create booking request';
      
      try {
        const errorText = await response.text();
        console.log('🔍 Raw error response:', errorText);
        
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        console.log('🔍 Parsed error data:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.log('🔍 Error parsing response:', parseError);
        // Keep default message if can't parse
      }
      
      console.log('🔍 Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async getMyRequests() {
    // Get user from localStorage
    const userStr = localStorage.getItem('sweat24_user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) {
      console.log('🔍 getMyRequests: No user or token found');
      console.log('🔍 userStr exists:', !!userStr);
      console.log('🔍 token exists:', !!token);
      return [];
    }
    
    const user = JSON.parse(userStr);
    console.log('🔍 getMyRequests: Making request for user:', user.id);
    console.log('🔍 getMyRequests: Token:', token?.substring(0, 20) + '...');
    
    // Use direct fetch with user authentication
    const response = await fetch(buildApiUrl('/booking-requests/my-requests'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('🔍 getMyRequests: Response status:', response.status);
    console.log('🔍 getMyRequests: Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('🔍 getMyRequests: Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.log('🔍 getMyRequests: Parsed error data:', errorData);
      } catch (parseError) {
        console.log('🔍 getMyRequests: Could not parse error as JSON');
      }
      
      return [];
    }
    
    const data = await response.json();
    console.log('🔍 getMyRequests: Success response:', data);
    
    // Handle paginated response from Laravel
    if (data && data.data && Array.isArray(data.data)) {
      console.log('🔍 getMyRequests: Returning paginated data:', data.data);
      return data.data;
    }
    
    // Fallback for direct array response
    return Array.isArray(data) ? data : [];
  },

  async cancel(id: string | number, reason?: string) {
    // Get user and auth token
    const userStr = localStorage.getItem('sweat24_user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) throw new Error('Not authenticated');
    
    const user = JSON.parse(userStr);
    console.log('🔍 Cancel booking request:', id, 'for user:', user.id);
    
    // First try with empty body as per API specification
    console.log('🔍 Cancel request - trying with empty body');
    
    const response = await fetch(buildApiUrl(`/booking-requests/${id}/cancel`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    console.log('🔍 Cancel response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('🔍 Cancel error response:', errorText);
      throw new Error('Failed to cancel booking request: ' + errorText);
    }
    return response.json();
  }
};

// Trainers
export const trainerService = {
  async getAll() {
    const response = await fetch(buildApiUrl('/trainers'), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch trainers');
    return response.json();
  },

  async getById(id: string | number) {
    const response = await fetch(buildApiUrl(`/trainers/${id}`), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch trainer');
    return response.json();
  }
};

// Packages
export const packageService = {
  async getAll() {
    // Use direct fetch to avoid auth issues
    const response = await fetch(buildApiUrl('/packages'), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Failed to fetch packages');
    return response.json();
  },

  async getById(id: string | number) {
    const response = await fetch(buildApiUrl(`/packages/${id}`), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Failed to fetch package');
    return response.json();
  }
};

// Dashboard
export const dashboardService = {
  async getStats() {
    try {
      // Get auth token for authenticated request
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found, returning default stats');
        return { bookings_today: 0, total_users: 0, active_classes: 0 };
      }

      const response = await fetch(buildApiUrl('/dashboard/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.log(`Dashboard stats API returned ${response.status}, returning default stats`);
        // Return empty stats instead of throwing error
        return { bookings_today: 0, total_users: 0, active_classes: 0 };
      }
      const data = await response.json();
      return data || { bookings_today: 0, total_users: 0, active_classes: 0 };
    } catch (error) {
      console.log('Dashboard stats network error, returning default stats:', error);
      // Network error - return empty stats
      return { bookings_today: 0, total_users: 0, active_classes: 0 };
    }
  }
};

// Profile (active packages)
export const profileService = {
  async getActivePackages() {
    const token = localStorage.getItem('auth_token');
    if (!token) return [];

    const response = await fetch(buildApiUrl(API_ENDPOINTS.profile), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    const packages = (data?.user?.packages ?? data?.packages ?? []);
    return Array.isArray(packages) ? packages : [];
  }
};

// User Profile (removed - using newer implementation below)

// Waitlist
export const waitlistService = {
  async join(classId: string | number) {
    // Use direct fetch to avoid auth issues
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) throw new Error('Not authenticated');
    
    const user = JSON.parse(userStr);
    const response = await fetch(buildApiUrl(`/classes/${classId}/waitlist/join`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ user_id: user.id })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to join waitlist');
    return data;
  },

  async leave(classId: string | number) {
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) throw new Error('Not authenticated');
    
    const user = JSON.parse(userStr);
    const response = await fetch(buildApiUrl(`/classes/${classId}/waitlist/leave`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ user_id: user.id })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to leave waitlist');
    return data;
  },

  async getStatus(classId: string | number) {
    // Just return empty status to avoid auth issues
    return { position: null, total: 0 };
  }
};

// Store Products
export const storeProductService = {
  async getAll(category?: string) {
    const url = category 
      ? buildApiUrl(`/store/products?category=${category}`)
      : buildApiUrl('/store/products');
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getById(slug: string) {
    const response = await fetch(buildApiUrl(`/store/products/${slug}`), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  }
};

// Generic API service for authenticated requests
export const apiService = {
  async get(url: string) {
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) throw new Error('Not authenticated');
    
    const response = await fetch(buildApiUrl(url), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  
  async post(url: string, data: any) {
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) throw new Error('Not authenticated');
    
    const response = await fetch(buildApiUrl(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  
  async put(url: string, data?: any) {
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) throw new Error('Not authenticated');
    
    const response = await fetch(buildApiUrl(url), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }
};

export const notificationService = {
  async getAll() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token for notifications');
        return [];
      }

      const response = await fetch(buildApiUrl('/notifications/user'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Notifications endpoint not found');
          return [];
        }
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      // Handle Laravel paginated response
      if (data && data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(id: number) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(buildApiUrl(`/notifications/${id}/read`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(buildApiUrl('/notifications/read-all'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};

// Order History Service
export const orderHistoryService = {
  async getOrderHistory(userId?: number) {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('sweat24_user');
      
      if (!token && !userId) {
        throw new Error('Not authenticated');
      }

      // Build URL - use user_id parameter if provided, otherwise use Bearer token
      let url = buildApiUrl('/orders/history');
      if (userId) {
        url += `?user_id=${userId}`;
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Order history API error:', errorData);
        throw new Error('Failed to fetch order history');
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.error || 'Failed to fetch order history');
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }
};

// Loyalty Service
export const loyaltyService = {
  async getDashboard() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // ✅ ΣΩΣΤΟ ENDPOINT: https://sweat93laravel.obs.com.gr/api/v1/loyalty/dashboard
      const response = await fetch('https://sweat93laravel.obs.com.gr/api/v1/loyalty/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Παρακαλώ συνδεθείτε ξανά');
        }
        if (response.status === 404) {
          throw new Error('Δεν βρέθηκαν δεδομένα loyalty');
        }
        if (response.status === 500) {
          throw new Error('Πρόβλημα διακομιστή, προσπαθήστε αργότερα');
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch loyalty dashboard`);
      }

      const data = await response.json();
      console.log('✅ Loyalty Dashboard Response:', data);
      
      // ✅ ΔΙΟΡΘΩΣΗ: Επιστρέφω τα δεδομένα από το data.data
      const dashboardData = data.data || data;
      console.log('✅ Parsed dashboard data:', dashboardData);
      
      return dashboardData;
    } catch (error) {
      console.error('❌ Error fetching loyalty dashboard:', error);
      throw error;
    }
  },

  async getAvailableRewards() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // ✅ ΣΩΣΤΟ ENDPOINT: https://sweat93laravel.obs.com.gr/api/v1/loyalty/rewards/available
      const response = await fetch('https://sweat93laravel.obs.com.gr/api/v1/loyalty/rewards/available', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Παρακαλώ συνδεθείτε ξανά');
        }
        if (response.status === 404) {
          throw new Error('Δεν βρέθηκαν διαθέσιμα rewards');
        }
        if (response.status === 500) {
          throw new Error('Πρόβλημα διακομιστή, προσπαθήστε αργότερα');
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch available rewards`);
      }

      const data = await response.json();
      console.log('✅ Available Rewards Response:', data);
      
      // ✅ ΔΙΟΡΘΩΣΗ: Τα rewards είναι στο data.rewards, όχι στο root
      let rewards = [];
      
      if (data.data && Array.isArray(data.data.rewards)) {
        rewards = data.data.rewards;
        console.log(`✅ Found ${rewards.length} loyalty rewards in data.rewards`);
      } else if (Array.isArray(data.rewards)) {
        rewards = data.rewards;
        console.log(`✅ Found ${rewards.length} loyalty rewards in rewards`);
      } else if (Array.isArray(data)) {
        rewards = data;
        console.log(`✅ Found ${rewards.length} loyalty rewards in root array`);
      } else {
        console.log('⚠️ No rewards array found in response structure:', Object.keys(data));
        rewards = [];
      }
      
      return rewards;
    } catch (error) {
      console.error('❌ Error fetching available rewards:', error);
      throw error;
    }
  },

  async redeemReward(rewardId: number) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // ✅ ΣΩΣΤΟ ENDPOINT: https://sweat93laravel.obs.com.gr/api/v1/loyalty/rewards/{id}/redeem
      const response = await fetch(`https://sweat93laravel.obs.com.gr/api/v1/loyalty/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Redeem error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Παρακαλώ συνδεθείτε ξανά');
        }
        if (response.status === 404) {
          throw new Error('Το reward δεν βρέθηκε');
        }
        if (response.status === 400) {
          throw new Error('Δεν έχετε αρκετούς πόντους για αυτό το reward');
        }
        
        throw new Error('Failed to redeem reward');
      }

      const data = await response.json();
      console.log('✅ Reward redeemed successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error redeeming reward:', error);
      throw error;
    }
  }
};

// Referrals Service
export const referralsService = {
  async getDashboard() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(buildApiUrl('/referrals/dashboard'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Παρακαλώ συνδεθείτε ξανά');
        }
        if (response.status === 404) {
          throw new Error('Δεν βρέθηκαν δεδομένα');
        }
        if (response.status === 500) {
          throw new Error('Πρόβλημα διακομιστή, προσπαθήστε αργότερα');
        }
        throw new Error('Failed to fetch referrals dashboard');
      }

      const data = await response.json();
      return data.data || data; // Handle both formats
    } catch (error) {
      console.error('Error fetching referrals dashboard:', error);
      throw error;
    }
  },

  async getAvailableTiers() {
    try {
      // This endpoint doesn't require authentication according to the guide
      const response = await fetch(buildApiUrl('/referrals/available-tiers'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Δεν βρέθηκαν δεδομένα');
        }
        if (response.status === 500) {
          throw new Error('Πρόβλημα διακομιστή, προσπαθήστε αργότερα');
        }
        throw new Error('Failed to fetch available tiers');
      }

      const data = await response.json();
      return data.data || data; // Handle both formats
    } catch (error) {
      console.error('Error fetching available tiers:', error);
      throw error;
    }
  },

  // Testing endpoint for development
  async getTestDashboard(userId: number) {
    try {
      const response = await fetch(buildApiUrl(`/referrals/test-dashboard/${userId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test dashboard');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching test dashboard:', error);
      throw error;
    }
  }
};

// User Profile Service
export const userService = {
  async getCurrentUser() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(buildApiUrl('/auth/me'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear auth if token is invalid
          localStorage.removeItem('sweat24_user');
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch user');
      }
      
      const data = await response.json();
      if (data.success && data.user) {
        // Update local storage with fresh user data
        localStorage.setItem('sweat24_user', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  async updateProfile(userId: number, data: any) {
    try {
      const token = localStorage.getItem('sweat24_token');
      const response = await fetch(buildApiUrl('/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Validation failed');
        }
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async uploadAvatar(file: File) {
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(buildApiUrl('/profile/avatar'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Validation failed');
        }
        throw new Error('Failed to upload avatar');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
};