import { userService } from '@/services/apiService';
import { apiRequest } from '@/config/api';
import * as API from '@/config/api';

/**
 * Ενημερώνει το status του χρήστη user@sweat24.gr σε ενεργή συνδρομή
 */
export async function updateUserStatusToActive(): Promise<void> {
  try {
    // Βρίσκουμε τον χρήστη user@sweat24.gr
    const targetEmail = 'user@sweat24.gr';
    
    // Ανακτούμε όλους τους χρήστες για να βρούμε τον συγκεκριμένο
    const response = await apiRequest(API.API_ENDPOINTS.users.list);
    const users = await response.json();
    
    const targetUser = users.find((user: any) => user.email === targetEmail);
    
    if (!targetUser) {
      console.error(`Δεν βρέθηκε χρήστης με email ${targetEmail}`);
      return;
    }
    
    // Ενημερώνουμε το status σε active και προσθέτουμε συνεδρίες
    const updatedData = {
      status: 'active',
      remaining_sessions: 10,
      total_sessions: 10,
      package_start_date: new Date().toISOString().split('T')[0],
      package_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 μέρες μπροστά
      membership_type: 'Premium',
      last_visit: new Date().toISOString().split('T')[0],
    };
    
    // Ενημερώνουμε τον χρήστη μέσω API
    const updateResponse = await userService.updateProfile(targetUser.id, updatedData);
    
    console.log('Επιτυχής ενημέρωση του χρήστη:', updateResponse);
    
    // Ενημερώνουμε και το localStorage αν ο χρήστης είναι συνδεδεμένος
    const currentUserStr = localStorage.getItem('sweat24_user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.email === targetEmail) {
        const updatedUser = { ...currentUser, ...updatedData };
        localStorage.setItem('sweat24_user', JSON.stringify(updatedUser));
        console.log('Ενημερώθηκε και το localStorage για τον συνδεδεμένο χρήστη');
      }
    }
    
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση του status:', error);
    throw error;
  }
}

/**
 * Ενημερώνει άμεσα το localStorage για τον χρήστη user@sweat24.gr (για demo purposes)
 */
export function updateLocalStorageUserStatus(): void {
  try {
    const currentUserStr = localStorage.getItem('sweat24_user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      
      // Ελέγχουμε αν είναι ο σωστός χρήστης
      if (currentUser.email === 'user@sweat24.gr') {
        const updatedUser = {
          ...currentUser,
          status: 'active',
          remaining_sessions: 10,
          total_sessions: 10,
          package_start_date: new Date().toISOString().split('T')[0],
          package_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          membership_type: 'Premium',
          last_visit: new Date().toISOString().split('T')[0],
        };
        
        localStorage.setItem('sweat24_user', JSON.stringify(updatedUser));
        console.log('Το status του χρήστη user@sweat24.gr ενημερώθηκε σε ενεργή συνδρομή!');
        
        // Ανανεώνουμε τη σελίδα για να φανούν οι αλλαγές
        window.location.reload();
      } else {
        console.log('Ο συνδεδεμένος χρήστης δεν είναι ο user@sweat24.gr');
      }
    } else {
      console.log('Δεν υπάρχει συνδεδεμένος χρήστης');
    }
  } catch (error) {
    console.error('Σφάλμα κατά την ενημέρωση του localStorage:', error);
  }
} 