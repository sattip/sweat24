// Mock data για testing χωρίς backend
export const mockLoyaltyDashboard = {
  current_points: 1250,
  total_earned_points: 3500,
  redeemed_rewards_count: 5,
  next_tier: {
    name: "Gold Member",
    points_required: 2000,
    points_needed: 750
  },
  current_tier: {
    name: "Silver Member",
    benefits: [
      "10% έκπτωση σε προϊόντα",
      "Προτεραιότητα σε κρατήσεις",
      "Δωρεάν towel service"
    ]
  }
};

export const mockRewards = [
  {
    id: 1,
    name: "Δωρεάν Προσωπική Προπόνηση",
    description: "Μία ώρα προσωπικής προπόνησης με έμπειρο trainer",
    points_required: 800,
    category: "training",
    expires_at: "2024-12-31T23:59:59Z",
    is_affordable: true,
    is_limited_time: false
  },
  {
    id: 2,
    name: "Premium Protein Shake",
    description: "Υψηλής ποιότητας protein shake μετά την προπόνηση",
    points_required: 300,
    category: "product",
    expires_at: "2024-08-15T23:59:59Z",
    is_affordable: true,
    is_limited_time: true
  },
  {
    id: 3,
    name: "VIP Spa Package",
    description: "Πλήρες spa package με massage και sauna",
    points_required: 2000,
    category: "premium",
    expires_at: null,
    is_affordable: false,
    is_limited_time: false
  }
];

export const mockReferralDashboard = {
  referral_code: "SWEAT93-USER123",
  referral_link: "https://sweat93.gr/invite/USER123",
  total_referrals: 3,
  next_tier: {
    name: "Bronze Referrer",
    referrals_required: 5,
    reward_name: "Δωρεάν Monthly Pass"
  },
  earned_rewards: [
    {
      id: 1,
      name: "Δωρεάν Προπόνηση",
      status: "available",
      expires_at: "2024-09-01T23:59:59Z"
    }
  ],
  referred_friends: [
    { name: "Μαρία Παπαδοπούλου", status: "Ενεργό μέλος" },
    { name: "Γιάννης Αντωνίου", status: "Ενεργό μέλος" },
    { name: "Άννα Γεωργίου", status: "Εκκρεμεί εγγραφή" }
  ]
};

export const mockReferralTiers = [
  {
    id: 1,
    name: "Starter",
    referrals_required: 1,
    reward_name: "Δωρεάν Προπόνηση",
    reward_description: "Μία δωρεάν ομαδική προπόνηση",
    expires_at: null
  },
  {
    id: 2,
    name: "Bronze",
    referrals_required: 3,
    reward_name: "Protein Pack",
    reward_description: "Set με premium supplements",
    expires_at: "2024-12-31T23:59:59Z"
  },
  {
    id: 3,
    name: "Silver",
    referrals_required: 5,
    reward_name: "Monthly Pass",
    reward_description: "Ένας μήνας δωρεάν συνδρομή",
    expires_at: null
  },
  {
    id: 4,
    name: "Gold",
    referrals_required: 10,
    reward_name: "VIP Experience",
    reward_description: "Πλήρες VIP πακέτο με personal trainer",
    expires_at: null
  }
]; 