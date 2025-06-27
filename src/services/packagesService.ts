import { apiService } from './api';

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  class_credits: number;
  features: string[];
  is_active: boolean;
  popular?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserPackage {
  id: number;
  user_id: number;
  package_id: number;
  package_name: string;
  start_date: string;
  end_date: string;
  remaining_credits: number;
  total_credits: number;
  status: 'active' | 'expired' | 'suspended';
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchasePackageRequest {
  package_id: number;
  payment_method: 'cash' | 'card' | 'transfer';
  auto_renew?: boolean;
}

class PackagesService {
  async getAllPackages(): Promise<Package[]> {
    return apiService.get<Package[]>('/packages');
  }

  async getActivePackages(): Promise<Package[]> {
    return apiService.get<Package[]>('/packages?active=true');
  }

  async getPackageById(id: number): Promise<Package> {
    return apiService.get<Package>(`/packages/${id}`);
  }

  async getUserPackages(): Promise<UserPackage[]> {
    return apiService.get<UserPackage[]>('/user/packages');
  }

  async getCurrentPackage(): Promise<UserPackage | null> {
    const packages = await this.getUserPackages();
    return packages.find(pkg => pkg.status === 'active') || null;
  }

  async purchasePackage(purchaseData: PurchasePackageRequest): Promise<UserPackage> {
    return apiService.post<UserPackage>('/user/packages', purchaseData);
  }

  async cancelPackage(userPackageId: number): Promise<void> {
    return apiService.put(`/user/packages/${userPackageId}`, { status: 'suspended' });
  }

  async renewPackage(userPackageId: number): Promise<UserPackage> {
    return apiService.post<UserPackage>(`/user/packages/${userPackageId}/renew`);
  }

  async toggleAutoRenew(userPackageId: number, autoRenew: boolean): Promise<UserPackage> {
    return apiService.put<UserPackage>(`/user/packages/${userPackageId}`, { auto_renew: autoRenew });
  }

  // Calculate days remaining for a package
  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Check if package is expiring soon (within 7 days)
  isExpiringSoon(endDate: string): boolean {
    return this.getDaysRemaining(endDate) <= 7 && this.getDaysRemaining(endDate) > 0;
  }

  // Check if it's the last session (1 credit remaining)
  isLastSession(remainingCredits: number): boolean {
    return remainingCredits === 1;
  }

  // Get package status for UI alerts
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
}

export const packagesService = new PackagesService();
export default packagesService;