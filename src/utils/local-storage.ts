
// Utility functions for local storage management

/**
 * Sets an item in local storage with a prefix to avoid conflicts
 */
export const setLocalStorageItem = (key: string, value: any): void => {
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(`sweat93_${key}`, serializedValue);
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
};

/**
 * Gets an item from local storage with a prefix
 */
export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`sweat93_${key}`);
    if (item === null) {
      return defaultValue;
    }
    return (item.startsWith('{') || item.startsWith('[')) ? JSON.parse(item) : item as unknown as T;
  } catch (err) {
    console.error('Error reading from localStorage', err);
    return defaultValue;
  }
};

/**
 * Removes an item from local storage with a prefix
 */
export const removeLocalStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(`sweat93_${key}`);
  } catch (err) {
    console.error('Error removing from localStorage', err);
  }
};

/**
 * Checks if user has agreed to gym rules
 */
export const hasAgreedToGymRules = (): boolean => {
  return getLocalStorageItem<boolean>('agreed_to_gym_rules', false);
};

/**
 * Saves that user has agreed to gym rules
 */
export const saveGymRulesAgreement = (): void => {
  setLocalStorageItem('agreed_to_gym_rules', true);
};

/**
 * Checks if this is the first booking attempt
 */
export const isFirstBookingAttempt = (): boolean => {
  return !getLocalStorageItem<boolean>('has_booked_before', false);
};

/**
 * Saves that user has attempted a booking
 */
export const saveBookingAttempt = (): void => {
  setLocalStorageItem('has_booked_before', true);
};
