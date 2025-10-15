import { Reward } from '../api/modules/pointsApi';

// Τύποι ανταμοιβών που χρειάζονται καλάθι (physical delivery)
const CART_REQUIRED_TYPES = ['gift_card', 'merchandise', 'product'];

// Τύποι ανταμοιβών που είναι instant (δεν χρειάζονται καλάθι)
const INSTANT_REWARD_TYPES = ['free_session', 'discount', 'premium'];

/**
 * Ελέγχει αν μια ανταμοιβή χρειάζεται να μπει στο καλάθι
 */
export const requiresCart = (reward: Reward): boolean => {
  return CART_REQUIRED_TYPES.includes(reward.reward_type);
};

/**
 * Ελέγχει αν μια ανταμοιβή είναι instant (άμεση παράδοση)
 */
export const isInstantReward = (reward: Reward): boolean => {
  return INSTANT_REWARD_TYPES.includes(reward.reward_type);
};

/**
 * Επιστρέφει το κατάλληλο μήνυμα για τον τύπο ανταμοιβής
 */
export const getRedemptionMessage = (reward: Reward): string => {
  switch (reward.reward_type) {
    case 'gift_card':
      return 'Η δωροκάρτα θα προστεθεί στο καλάθι σας για παράδοση';
    case 'merchandise':
      return 'Το προϊόν θα προστεθεί στο καλάθι σας για παράδοση';
    case 'product':
      return 'Το προϊόν θα προστεθεί στο καλάθι σας για παράδοση';
    case 'free_session':
      return 'Η δωρεάν προπόνηση θα ενεργοποιηθεί άμεσα στον λογαριασμό σας';
    case 'discount':
      return 'Ο κωδικός έκπτωσης θα είναι διαθέσιμος άμεσα';
    case 'premium':
      return 'Τα premium χαρακτηριστικά θα ενεργοποιηθούν άμεσα';
    default:
      return 'Η ανταμοιβή θα επεξεργαστεί σύμφωνα με τον τύπο της';
  }
};

/**
 * Επιστρέφει το κατάλληλο action text για το κουμπί εξαργύρωσης
 */
export const getRedemptionButtonText = (reward: Reward): string => {
  if (requiresCart(reward)) {
    return 'Προσθήκη στο Καλάθι';
  }
  return 'Εξαργύρωση Τώρα';
};

/**
 * Μετατρέπει μια ανταμοιβή σε cart item
 */
export const rewardToCartItem = (reward: Reward) => {
  // Για δωροκάρτες, εφαρμόζουμε αρνητική τιμή (έκπτωση)
  let itemPrice = 0;
  if (reward.reward_type === 'gift_card') {
    // Εξάγουμε το ποσό από το reward_value (π.χ. "5€" -> -5)
    const valueMatch = reward.reward_value.match(/(\d+)/);
    if (valueMatch) {
      itemPrice = -parseFloat(valueMatch[1]);
    }
  }

  return {
    id: `reward-${reward.id}`,
    name: reward.name,
    price: itemPrice, // Αρνητική τιμή για δωροκάρτες (έκπτωση)
      image: reward.image_url || '/logo-light.png',
    quantity: 1,
    options: {
      type: 'reward',
      reward_type: reward.reward_type,
      points_cost: reward.points_cost.toString(),
      reward_value: reward.reward_value
    }
  };
};

/**
 * Ελέγχει αν ένα cart item είναι ανταμοιβή
 */
export const isRewardCartItem = (item: any): boolean => {
  return item.options?.type === 'reward';
};
