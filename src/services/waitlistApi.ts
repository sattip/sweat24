import * as API from '@/config/api';

export interface WaitlistEntry {
  waitlist_id: number;
  position: number | null;
  status: 'waiting' | 'notified';
  notified_at: string | null;
  expires_at: string | null;
  created_at: string;
  class: {
    id: number;
    name: string;
    date: string;
    time: string;
    instructor: string;
    location: string;
    available_spots: number;
    is_full: boolean;
  };
}

export interface WaitlistStatus {
  in_waitlist: boolean;
  position?: number | null;
  status?: 'waiting' | 'notified';
  notified_at?: string | null;
  expires_at?: string | null;
}

export interface JoinWaitlistResponse {
  success: boolean;
  message: string;
  position: number;
  waitlist_id: number;
}

export interface DeclineWaitlistResponse {
  success: boolean;
  message: string;
  stayed_in_waitlist: boolean;
}

export const waitlistApi = {
  /**
   * Get all waitlists for the current user
   */
  async getMyWaitlists(): Promise<{ data: WaitlistEntry[]; total: number }> {
    const response = await API.apiRequest('/my-waitlists');

    if (!response.ok) {
      throw new Error('Failed to fetch waitlists');
    }

    const data = await response.json();
    return data;
  },

  /**
   * Get waitlist for a specific class (admin only)
   */
  async getClassWaitlist(classId: number): Promise<{ waitlist: any[]; total: number }> {
    const response = await API.apiRequest(`/classes/${classId}/waitlist`);

    if (!response.ok) {
      throw new Error('Failed to fetch class waitlist');
    }

    const data = await response.json();
    return data;
  },

  /**
   * Check waitlist status for a specific class
   */
  async checkStatus(classId: number): Promise<WaitlistStatus> {
    const response = await API.apiRequest(`/classes/${classId}/waitlist/status`);

    if (!response.ok) {
      throw new Error('Failed to check waitlist status');
    }

    const data = await response.json();
    return data;
  },

  /**
   * Join waitlist for a class
   */
  async join(classId: number): Promise<JoinWaitlistResponse> {
    const response = await API.apiRequest(`/classes/${classId}/waitlist/join`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to join waitlist');
    }

    return data;
  },

  /**
   * Leave waitlist for a class
   */
  async leave(classId: number): Promise<void> {
    const response = await API.apiRequest(`/classes/${classId}/waitlist/leave`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to leave waitlist');
    }
  },

  /**
   * Decline a waitlist spot notification
   * @param stayInWaitlist - If true, moves user to back of queue. If false, removes from waitlist entirely.
   */
  async decline(classId: number, stayInWaitlist: boolean = false): Promise<DeclineWaitlistResponse> {
    const response = await API.apiRequest(`/classes/${classId}/waitlist/decline`, {
      method: 'POST',
      body: JSON.stringify({ stay_in_waitlist: stayInWaitlist }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to decline waitlist spot');
    }

    return data;
  },
};
