// Validation constants and functions based on backend requirements

export const VALIDATION_RULES = {
  gender: {
    options: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: false
  },
  weight: {
    min: 30,
    max: 300,
    type: 'number',
    decimals: 2,
    required: false
  },
  height: {
    min: 100, 
    max: 250,
    type: 'number',
    decimals: 2,
    required: false
  },
  phone: {
    pattern: /^([0-9\s\-\+\(\)]*)$/,
    required: false
  },
  emergency_phone: {
    pattern: /^([0-9\s\-\+\(\)]*)$/,
    required: false
  },
  date_of_birth: {
    format: 'YYYY-MM-DD',
    required: false,
    maxDate: 'today',
    minDate: '1900-01-01'
  }
};

export const GENDER_MAPPING = {
  'male': 'Άνδρας',
  'female': 'Γυναίκα', 
  'other': 'Άλλο',
  'prefer_not_to_say': 'Προτιμώ να μη το πω'
};

export const ERROR_MESSAGES = {
  'gender.in': 'Μη έγκυρη επιλογή φύλου.',
  'weight.between': 'Το βάρος πρέπει να είναι μεταξύ 30 και 300 κιλών.',
  'height.between': 'Το ύψος πρέπει να είναι μεταξύ 100 και 250 εκατοστών.',
  'phone.regex': 'Παρακαλώ δώστε έναν έγκυρο αριθμό τηλεφώνου.',
  'emergency_phone.regex': 'Παρακαλώ δώστε έναν έγκυρο αριθμό τηλεφώνου έκτακτης ανάγκης.',
  'date_of_birth.before': 'Η ημερομηνία γέννησης πρέπει να είναι στο παρελθόν.',
  'email.unique': 'Αυτό το email χρησιμοποιείται ήδη.',
  'name.locked': 'Το όνομα είναι κλειδωμένο μετά την έγκριση του λογαριασμού.'
};

// Validation functions
export const validateWeight = (value: string): string | null => {
  if (!value) return null; // Optional field
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return 'Το βάρος πρέπει να είναι αριθμός';
  }
  
  if (num < VALIDATION_RULES.weight.min || num > VALIDATION_RULES.weight.max) {
    return ERROR_MESSAGES['weight.between'];
  }
  
  return null;
};

export const validateHeight = (value: string): string | null => {
  if (!value) return null; // Optional field
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return 'Το ύψος πρέπει να είναι αριθμός';
  }
  
  if (num < VALIDATION_RULES.height.min || num > VALIDATION_RULES.height.max) {
    return ERROR_MESSAGES['height.between'];
  }
  
  return null;
};

export const validateGender = (value: string): string | null => {
  if (!value) return null; // Optional field
  
  if (!VALIDATION_RULES.gender.options.includes(value)) {
    return ERROR_MESSAGES['gender.in'];
  }
  
  return null;
};

export const validatePhone = (value: string): string | null => {
  if (!value) return null; // Optional field
  
  if (!VALIDATION_RULES.phone.pattern.test(value)) {
    return ERROR_MESSAGES['phone.regex'];
  }
  
  return null;
};

export const validateEmail = (value: string): string | null => {
  if (!value) return 'Το email είναι υποχρεωτικό';
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return 'Παρακαλώ δώστε έγκυρο email';
  }
  
  return null;
};

export const validateName = (value: string): string | null => {
  if (!value || value.trim().length === 0) {
    return 'Το όνομα είναι υποχρεωτικό';
  }
  
  if (value.trim().length < 2) {
    return 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες';
  }
  
  return null;
};

// Validation helper for all profile fields
export const validateProfileData = (data: {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  weight?: string;
  height?: string;
}): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  if (data.name !== undefined) {
    const nameError = validateName(data.name);
    if (nameError) errors.name = nameError;
  }
  
  if (data.email !== undefined) {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }
  
  if (data.phone !== undefined) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  if (data.gender !== undefined) {
    const genderError = validateGender(data.gender);
    if (genderError) errors.gender = genderError;
  }
  
  if (data.weight !== undefined) {
    const weightError = validateWeight(data.weight);
    if (weightError) errors.weight = weightError;
  }
  
  if (data.height !== undefined) {
    const heightError = validateHeight(data.height);
    if (heightError) errors.height = heightError;
  }
  
  return errors;
};
