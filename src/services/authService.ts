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
}

export interface User {
  id: number;
  name: string;
  email: string;
  membership_type: string;
  phone?: string;
  status: string;
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
    
    const response = await apiRequest('/auth/login', {
      method: 'POST',
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
    
    // Store user data and token
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
    // First, create the user
    const registerResponse = await apiRequest(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
      }),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      throw new Error(error.message || 'Registration failed');
    }

    const authData = await registerResponse.json();
    
    // Store auth data
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    // Then, save the signature
    try {
      await apiRequest(API_ENDPOINTS.signatures, {
        method: 'POST',
        body: JSON.stringify({
          user_id: authData.user.id,
          signature_data: data.signature,
          document_type: data.documentType || 'terms_and_conditions',
          document_version: data.documentVersion || '1.0',
        }),
      });
    } catch (error) {
      console.error('Failed to save signature:', error);
      // Don't fail the registration if signature saving fails
    }
    
    return authData;
  }

  async logout(): Promise<void> {
    try {
      await apiRequest(API_ENDPOINTS.auth.logout, {
        method: 'POST',
      });
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