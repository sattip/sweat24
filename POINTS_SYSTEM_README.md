# 📱 Points Rewards System - SWEAT24 Mobile App

## 🎯 Επισκόπηση

Ολοκληρωμένο σύστημα ανταμοιβών με πόντους για την SWEAT24 εφαρμογή. Οι χρήστες κερδίζουν πόντους με κάθε δραστηριότητά τους και τους εξαργυρώνουν για υπέροχες ανταμοιβές.

## 📂 Δομή Αρχείων

### API Layer
- `src/api/modules/pointsApi.ts` - API functions για πόντους και ανταμοιβές

### State Management
- `src/contexts/PointsContext.tsx` - React Context για διαχείριση πόντων

### UI Components
- `src/components/points/PointsCard.tsx` - Κάρτα εμφάνισης πόντων
- `src/components/points/RewardCard.tsx` - Κάρτα ανταμοιβής
- `src/components/points/PointsHistoryItem.tsx` - Στοιχείο ιστορικού
- `src/components/points/LoadingSpinner.tsx` - Loading states

### Pages/Screens
- `src/pages/PointsDashboard.tsx` - Κύρια σελίδα πόντων
- `src/pages/RewardsCatalog.tsx` - Κατάλογος ανταμοιβών
- `src/pages/PointsHistory.tsx` - Ιστορικό συναλλαγών

### Services
- `src/services/pointsNotificationService.ts` - Notifications για πόντους

## 🔗 API Endpoints

### Points Management
```typescript
GET /api/v1/points/user?user_id={id}           // Λήψη πόντων χρήστη
GET /api/v1/points/history?user_id={id}        // Ιστορικό πόντων
GET /api/v1/points/stats?user_id={id}          // Στατιστικά πόντων
```

### Rewards Management
```typescript
GET /api/v1/points/rewards/affordable?user_points={points}  // Διαθέσιμες ανταμοιβές
GET /api/v1/points/rewards                                  // Όλες οι ανταμοιβές
POST /api/v1/points/rewards/{id}/redeem                     // Εξαργύρωση ανταμοιβής
```

### Notifications
```typescript
GET /api/v1/points/notifications?user_id={id}              // Λήψη notifications
POST /api/v1/points/notifications/{id}/mark-read           // Σήμανση ως διαβασμένο
```

## 🚀 Χρήση

### 1. Προσθήκη PointsProvider στο App
```tsx
<AuthProvider>
  <PointsProvider>
    <YourApp />
  </PointsProvider>
</AuthProvider>
```

### 2. Χρήση του usePoints Hook
```tsx
import { usePoints } from '../contexts/PointsContext';

const MyComponent = () => {
  const { state, actions } = usePoints();
  
  // Λήψη δεδομένων
  useEffect(() => {
    actions.fetchUserPoints();
    actions.fetchRewards();
  }, []);

  return (
    <div>
      <h2>Πόντοι: {state.balance}</h2>
      <button onClick={() => actions.redeemReward(rewardId)}>
        Εξαργύρωση
      </button>
    </div>
  );
};
```

### 3. Προσθήκη Routes
```tsx
// Στο App.tsx
<Route path="/points" element={<ProtectedRoute><PointsDashboard /></ProtectedRoute>} />
<Route path="/points/rewards" element={<ProtectedRoute><RewardsCatalog /></ProtectedRoute>} />
<Route path="/points/history" element={<ProtectedRoute><PointsHistory /></ProtectedRoute>} />
```

## 📱 Features

### ✅ Ολοκληρωμένα
- 📊 Points Dashboard με στατιστικά
- 🎁 Rewards Catalog με φίλτρα και αναζήτηση
- 📈 Points History με export δυνατότητα
- 🔔 Real-time notifications
- 📱 Mobile-optimized UI
- 🔄 Auto-refresh δεδομένων
- ⚡ Loading states και error handling
- 🎨 Modern design με Tailwind CSS

### 🎯 Core Functionality
- **Points Earning**: Αυτόματη καταγραφή πόντων
- **Rewards Redemption**: Εξαργύρωση με ένα κλικ
- **History Tracking**: Πλήρες ιστορικό συναλλαγών
- **Real-time Updates**: Άμεση ενημέρωση balance
- **Filter & Search**: Προηγμένα φίλτρα αναζήτησης
- **Progress Tracking**: Πρόοδος προς επόμενες ανταμοιβές

## 🎨 UI Components Guide

### PointsCard
```tsx
<PointsCard 
  points={150}
  trend="up"
  trendValue={25}
/>
```

### RewardCard
```tsx
<RewardCard 
  reward={rewardObject}
  userPoints={userBalance}
  onRedeem={() => handleRedeem(reward.id)}
  loading={isRedeeming}
/>
```

### PointsHistoryItem
```tsx
<PointsHistoryItem 
  item={historyItem}
/>
```

## 🔔 Notifications

### Τύποι Notifications
- **Points Earned**: Κερδισμένοι πόντοι
- **Reward Redeemed**: Εξαργύρωση ανταμοιβής
- **Milestone Reached**: Επίτευγμα στόχου
- **Special Offers**: Ειδικές προσφορές

### Χρήση Notification Service
```tsx
import { usePointsNotifications } from '../services/pointsNotificationService';

const MyComponent = () => {
  const notifications = usePointsNotifications();
  
  // Ειδοποίηση για πόντους
  notifications.pointsEarned(25, 'Αγορά πακέτου €25');
  
  // Ειδοποίηση εξαργύρωσης
  notifications.rewardRedeemed('5€ Δωροκάρτα', 30);
};
```

## 📊 State Management

### PointsState Structure
```typescript
interface PointsState {
  balance: number;              // Τρέχων υπόλοιπο πόντων
  history: PointsHistoryItem[]; // Ιστορικό συναλλαγών
  rewards: Reward[];            // Διαθέσιμες ανταμοιβές
  stats: {                      // Στατιστικά
    total_earned: number;
    total_spent: number;
    this_month_earned: number;
    rank?: number;
  };
  loading: boolean;             // Loading state
  error: string | null;         // Error state
}
```

### Available Actions
```typescript
interface PointsActions {
  fetchUserPoints: () => Promise<void>;
  fetchPointsHistory: (filter?: 'earned' | 'spent') => Promise<void>;
  fetchRewards: () => Promise<void>;
  fetchStats: () => Promise<void>;
  redeemReward: (rewardId: number) => Promise<RedemptionResult | null>;
  refreshAllData: () => Promise<void>;
  clearError: () => void;
}
```

## 🔧 Customization

### Χρώματα και Στυλ
Το σύστημα χρησιμοποιεί Tailwind CSS classes. Μπορείς να προσαρμόσεις:

```css
/* Κύρια χρώματα */
.points-primary { @apply bg-purple-600; }
.points-secondary { @apply bg-purple-100; }
.points-accent { @apply text-yellow-500; }

/* Card styles */
.points-card { @apply bg-gradient-to-br from-purple-500 to-purple-700; }
.reward-card { @apply bg-white rounded-lg shadow-md; }
```

### Component Override
```tsx
// Custom PointsCard
const CustomPointsCard = ({ points, ...props }) => (
  <div className="custom-points-card">
    <h2>Οι Πόντοι μου: {points}</h2>
    {/* Custom implementation */}
  </div>
);
```

## 🚨 Error Handling

### API Errors
```typescript
// Στο PointsContext
try {
  const result = await pointsApi.redeemReward(rewardId, userId);
  // Success handling
} catch (error: any) {
  setState(prev => ({ 
    ...prev, 
    error: error.response?.data?.message || 'Σφάλμα εξαργύρωσης'
  }));
  
  toast({
    title: "Σφάλμα",
    description: error.message,
    variant: "destructive"
  });
}
```

### Loading States
```tsx
{state.loading && <LoadingState message="Φόρτωση..." />}
{state.error && (
  <ErrorMessage 
    message={state.error} 
    onRetry={actions.refreshAllData}
    onDismiss={actions.clearError}
  />
)}
```

## 📱 Mobile Optimization

### Responsive Design
- Οптимизация για μικρές οθόνες
- Touch-friendly buttons
- Swipe gestures για navigation
- Auto-refresh με pull-to-refresh

### Performance
- Lazy loading components
- Memoized calculations
- Debounced search
- Optimistic UI updates

## 🔮 Future Enhancements

### Planned Features
- [ ] Push notifications με FCM
- [ ] Offline support με service workers
- [ ] Points leaderboard
- [ ] Social sharing rewards
- [ ] Gamification badges
- [ ] Advanced analytics
- [ ] Points expiration system
- [ ] Multi-language support

### Integration Ideas
- [ ] Apple Wallet / Google Pay integration
- [ ] QR code rewards
- [ ] Location-based bonuses
- [ ] Social media integration
- [ ] Referral bonuses
- [ ] Seasonal promotions

## 🤝 Contributing

1. Fork το repository
2. Δημιούργησε feature branch (`git checkout -b feature/amazing-feature`)
3. Commit τις αλλαγές (`git commit -m 'Add amazing feature'`)
4. Push το branch (`git push origin feature/amazing-feature`)
5. Άνοιξε Pull Request

## 📄 License

Copyright © 2024 SWEAT24. All rights reserved.

---

**Καλή χρήση του Points Rewards System!** 🚀🎉
