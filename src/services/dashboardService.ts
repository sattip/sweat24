import { apiService } from './api';
import { User } from './authService';
import { UserPackage } from './packagesService';
import { Booking } from './classesService';

export interface DashboardStats {
  total_bookings: number;
  completed_sessions: number;
  upcoming_sessions: number;
  remaining_credits: number;
  days_until_expiry: number;
  favorite_trainer?: string;
  most_booked_class?: string;
  weekly_activity: Array<{
    date: string;
    sessions: number;
  }>;
}

export interface BirthdayReward {
  id: number;
  title: string;
  description: string;
  reward_type: 'free_session' | 'discount' | 'upgrade';
  value: number;
  expires_at: string;
  booking_code: string;
  is_used: boolean;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/dashboard/stats');
  }

  async getRecentActivity(): Promise<Booking[]> {
    return apiService.get<Booking[]>('/user/recent-activity');
  }

  async getUpcomingBookings(limit: number = 5): Promise<Booking[]> {
    return apiService.get<Booking[]>(`/bookings?status=confirmed&limit=${limit}`);
  }

  async getBirthdayRewards(): Promise<BirthdayReward[]> {
    return apiService.get<BirthdayReward[]>('/user/birthday-rewards');
  }

  async claimBirthdayReward(rewardId: number): Promise<BirthdayReward> {
    return apiService.post<BirthdayReward>(`/user/birthday-rewards/${rewardId}/claim`);
  }

  // Helper functions for dashboard logic
  isBirthdayWeek(dateOfBirth: string): boolean {
    if (!dateOfBirth) return false;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    // Set birth date to current year
    birthDate.setFullYear(today.getFullYear());
    
    // Check if birthday is within the next 7 days
    const diffTime = birthDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  }

  getPackageStatus(userPackage: UserPackage | null): 'normal' | 'last-session' | 'expiring-soon' | 'expired' {
    if (!userPackage) return 'expired';
    
    const today = new Date();
    const endDate = new Date(userPackage.end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) return 'expired';
    if (userPackage.remaining_credits === 1) return 'last-session';
    if (daysRemaining <= 7) return 'expiring-soon';
    
    return 'normal';
  }

  generateBirthdayReward(expirationDays: number = 14): BirthdayReward {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    return {
      id: Date.now(),
      title: '🎉 Birthday Special!',
      description: 'Claim your free personal training session as our birthday gift to you!',
      reward_type: 'free_session',
      value: 1,
      expires_at: expiresAt.toISOString(),
      booking_code: `BDAYPT${new Date().getFullYear()}`,
      is_used: false
    };
  }

  async updateUserProfile(profileData: Partial<User>): Promise<User> {
    return apiService.put<User>('/user/profile', profileData);
  }

  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    return apiService.post<{ url: string }>('/user/profile-picture', formData);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;