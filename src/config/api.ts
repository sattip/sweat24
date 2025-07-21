const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sweat93laravel.obs.com.gr';
const API_VERSION = '/api';

export const API_URL = `${API_BASE_URL}${API_VERSION}`;

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register', 
    logout: '/auth/logout',
    me: '/auth/me',
  },
  // Users
  users: {
    list: '/users',
    get: (id: string | number) => `/users/${id}`,
    create: '/users',
    update: (id: string | number) => `/users/${id}`,
    delete: (id: string | number) => `/users/${id}`,
  },
  // Classes
  classes: {
    list: '/classes',
    get: (id: string | number) => `/classes/${id}`,
  },
  // Bookings
  bookings: {
    list: '/bookings',
    create: '/bookings',
    checkIn: (id: string | number) => `/bookings/${id}/check-in`,
    cancel: (id: string | number) => `/bookings/${id}/cancel`,
  },
  // Waitlist
  waitlist: {
    join: (classId: string | number) => `/classes/${classId}/waitlist/join`,
    leave: (classId: string | number) => `/classes/${classId}/waitlist/leave`,
    status: (classId: string | number) => `/classes/${classId}/waitlist/status`,
  },
  // Packages
  packages: {
    list: '/packages',
    get: (id: string | number) => `/packages/${id}`,
  },
  // Dashboard
  dashboard: {
    stats: '/dashboard/stats',
  },
  // Signatures
  signatures: '/signatures',
  userSignatures: (userId: string | number) => `/users/${userId}/signatures`,
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};

// Helper function for API requests with authentication
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Don't redirect automatically - let the app handle auth failures
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // window.location.href = '/login'; // Disabled to prevent unwanted redirects
  }

  return response;
};