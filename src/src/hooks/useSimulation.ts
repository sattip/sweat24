import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SimulationState {
  packageState: 'normal' | 'expiring-soon' | 'last-session' | 'expired';
  remainingSessions: number;
  totalSessions: number;
  membershipType: string;
  birthdayWeek: boolean;
  lastVisit: string;
  packageStartDate?: string;
  packageEndDate?: string;
}

interface SimulatedUser {
  id: number;
  name: string;
  email: string;
  membership_type: string;
  phone?: string;
  status: string;
  remaining_sessions?: number;
  total_sessions?: number;
  join_date?: string;
  last_visit?: string;
  avatar?: string;
  birth_date?: string;
  package_start_date?: string;
  package_end_date?: string;
}

const DEFAULT_SIMULATION_STATE: SimulationState = {
  packageState: 'normal',
  remainingSessions: 10,
  totalSessions: 10,
  membershipType: 'Premium',
  birthdayWeek: false,
  lastVisit: new Date().toISOString().split('T')[0],
  packageStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
  packageEndDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 23 days from now
};

/**
 * Hook to manage simulation state for admin@sweat24.gr user
 * Returns simulated user data based on current simulation settings
 */
export const useSimulation = () => {
  const { user } = useAuth();
  const [simulationState, setSimulationState] = useState<SimulationState>(DEFAULT_SIMULATION_STATE);
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  // Check if current user is the admin tester
  const isAdminTester = user?.email === 'admin@sweat24.gr';

  useEffect(() => {
    if (isAdminTester) {
      // Load simulation state from localStorage on mount
      const saved = localStorage.getItem('simulation_state');
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          setSimulationState(parsedState);
          setIsSimulationActive(true);
        } catch (error) {
          console.error('Error parsing simulation state:', error);
        }
      }
    }
  }, [isAdminTester]);

  // Update simulation state
  const updateSimulationState = (newState: Partial<SimulationState>) => {
    if (!isAdminTester) return;

    const updatedState = { ...simulationState, ...newState };
    setSimulationState(updatedState);
    setIsSimulationActive(true);
    
    // Persist to localStorage
    localStorage.setItem('simulation_state', JSON.stringify(updatedState));
  };

  // Reset simulation to default state
  const resetSimulation = () => {
    if (!isAdminTester) return;

    setSimulationState(DEFAULT_SIMULATION_STATE);
    setIsSimulationActive(false);
    localStorage.removeItem('simulation_state');
  };

  // Generate simulated user data based on current simulation state
  const getSimulatedUser = (): SimulatedUser | null => {
    if (!isAdminTester || !user) return user;

    const simulatedUser: SimulatedUser = {
      ...user,
      membership_type: simulationState.membershipType,
      remaining_sessions: simulationState.remainingSessions,
      total_sessions: simulationState.totalSessions,
      last_visit: simulationState.lastVisit,
      package_start_date: simulationState.packageStartDate,
      package_end_date: simulationState.packageEndDate,
      // Add birth_date if birthday week is enabled (simulate birthday this week)
      birth_date: simulationState.birthdayWeek 
        ? getBirthdayWeekDate() 
        : user.birth_date || undefined
    };

    return simulatedUser;
  };

  // Helper function to generate a birth date that falls within this week
  const getBirthdayWeekDate = (): string => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create a birthday that's within the current week (past few days)
    const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
    const birthdayThisYear = new Date(today);
    birthdayThisYear.setDate(today.getDate() - daysAgo);
    
    // Set it to a past year (simulate actual birth year)
    const birthYear = currentYear - (25 + Math.floor(Math.random() * 10)); // 25-35 years old
    const birthDate = new Date(birthYear, birthdayThisYear.getMonth(), birthdayThisYear.getDate());
    
    return birthDate.toISOString().split('T')[0];
  };

  // Get package status based on simulation state
  const getPackageStatus = () => {
    if (!isAdminTester) {
      // For non-admin users, use the original logic
      if (!user?.remaining_sessions || user.remaining_sessions === 0) return "expired";
      if (user.remaining_sessions === 1) return "last-session";
      if (user.remaining_sessions <= 3) return "expiring-soon";
      return "normal";
    }

    return simulationState.packageState;
  };

  // Check if it's birthday week (for simulation or real user)
  const isBirthdayWeek = (): boolean => {
    if (!user) return false;
    
    if (isAdminTester && isSimulationActive) {
      return simulationState.birthdayWeek;
    }

    // Original birthday week logic for non-admin users
    const birthDate = user.birth_date;
    if (!birthDate) return false;
    
    const today = new Date();
    const birthday = new Date(birthDate);
    birthday.setFullYear(today.getFullYear());
    
    const weekBefore = new Date(birthday);
    weekBefore.setDate(birthday.getDate() - 7);
    
    return today >= weekBefore && today <= birthday;
  };

  return {
    isAdminTester,
    isSimulationActive,
    simulationState,
    updateSimulationState,
    resetSimulation,
    getSimulatedUser,
    getPackageStatus,
    isBirthdayWeek
  };
};

export default useSimulation;