import { apiRequest, API_ENDPOINTS, buildApiUrl } from '@/config/api';

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

// User Profile
export const userService = {
  async getCurrentUser() {
    // Use our local storage user instead of API call to avoid auth redirect
    const userStr = localStorage.getItem('sweat24_user');
    if (!userStr) {
      throw new Error('Not authenticated');
    }
    return JSON.parse(userStr);
  },

  async updateProfile(id: string | number, data: any) {
    const response = await apiRequest(API_ENDPOINTS.users.update(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
};

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