import { apiRequest, API_ENDPOINTS } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  signature: string;
  signedAt: string;
  documentType?: string;
  documentVersion?: string;
  // Medical history data
  medicalHistory?: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  membership_type: string;
  phone?: string;
  status: string;
  has_signed_terms?: boolean;
  remaining_sessions?: number;
  total_sessions?: number;
  used_sessions?: number;
  join_date?: string;
  last_visit?: string;
  avatar?: string;
  birth_date?: string;
  package_start_date?: string;
  package_end_date?: string;
  is_trial_user?: boolean;
  has_paid_after_trial?: boolean;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  purchased_services?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Clear any existing auth data before login
    this.clearAuth();
    
    // Use direct fetch to the correct backend domain
    const response = await fetch('https://sweat93laravel.obs.com.gr/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Check if user is pending
    if (data.user && data.user.status === 'pending') {
      throw new Error('Ο λογαριασμός σας βρίσκεται σε αναμονή έγκρισης. Θα λάβετε email μόλις εγκριθεί από τη γραμματεία.');
    }
    
    // Store user data and token only for approved users
    localStorage.setItem('sweat24_user', JSON.stringify(data.user));
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return {
      success: true,
      message: data.message || 'Login successful',
      user: data.user,
      token: data.token
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Determine the correct endpoint based on whether parent consent is present
    const hasParentConsent = !!(data as any).parentConsent;
    const endpoint = hasParentConsent 
      ? 'https://sweat93laravel.obs.com.gr/api/v1/auth/register-with-consent'
      : 'https://sweat93laravel.obs.com.gr/api/v1/auth/register';
    
    // First, create the user - use direct fetch to correct backend domain
    const registerResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        date_of_birth: (data as any).birth_date,  // Changed to date_of_birth as backend expects
        gender: (data as any).gender,
        phone: (data as any).phone,
        ...(data.medicalHistory && { medical_history: data.medicalHistory }),
        ...((data as any).howFoundUs && { how_found_us: (data as any).howFoundUs }),
        ...((data as any).parentConsent && { parent_consent: (data as any).parentConsent })
      }),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      throw new Error(error.message || 'Registration failed');
    }

    const authData = await registerResponse.json();
    
    // Don't store auth data for pending users - they can't login yet
    // localStorage.setItem('auth_token', authData.token);
    // localStorage.setItem('user', JSON.stringify(authData.user));
    
    // We skip signature saving during registration since user can't login yet
    // Signature will be collected when user logs in after approval
    
    return authData;
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('https://sweat93laravel.obs.com.gr/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      // Don't redirect here, let the router handle it
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // First try to get user from localStorage (our new system)
    const userFromStorage = this.getStoredUser();
    if (userFromStorage) {
      return userFromStorage;
    }
    
    // Fallback to API call if no user in localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const response = await apiRequest(API_ENDPOINTS.auth.me);
      if (!response.ok) {
        throw new Error('Failed to get user');
      }
      
      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      this.clearAuth();
      return null;
    }
  }

  getStoredUser(): User | null {
    // First check sweat24_user (our new system)
    const sweat24UserStr = localStorage.getItem('sweat24_user');
    if (sweat24UserStr) {
      try {
        return JSON.parse(sweat24UserStr);
      } catch {
        // Fall through to check 'user' key
      }
    }
    
    // Fallback to the old 'user' key
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token') || !!localStorage.getItem('sweat24_user');
  }

  clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('sweat24_user');
  }
}

export const authService = new AuthService();