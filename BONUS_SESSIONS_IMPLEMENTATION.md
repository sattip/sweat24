# 🎁 Bonus Sessions System - Implementation Guide

## Περιεχόμενα
1. [Τι έχει γίνει (Frontend)](#τι-έχει-γίνει-frontend)
2. [Τι χρειάζεται (Backend)](#τι-χρειάζεται-backend)
3. [Πώς θα λειτουργεί](#πώς-θα-λειτουργεί)
4. [Testing](#testing)

---

## ✅ Τι έχει γίνει (Frontend)

### 1. **SessionCountIndicator Component** (`src/components/SessionCountIndicator.tsx`)

Το component έχει ενημερωθεί να υποστηρίζει bonus sessions:

```typescript
interface SessionCountIndicatorProps {
  usedSessions?: number;
  totalSessions?: number | null;
  remainingSessions?: number | null;
  membershipType: string;
  bonusSessions?: number;           // ✨ ΝΕΟ
  bonusSessionsUsed?: number;       // ✨ ΝΕΟ
}
```

#### **Display Logic:**
- **Χωρίς Bonus:** `Πραγματοποιήθηκαν 2/8`
- **Με Bonus:** `Πραγματοποιήθηκαν 2/8+1` (δηλ. έχει 8 κανονικές + 1 δώρο)

#### **Warning Logic:**
- Λαμβάνει υπόψη και τα bonus sessions στο total
- Αν έχει 0 κανονικές αλλά 1 bonus → ΔΕΝ εμφανίζει warning

### 2. **RedemptionSuccessDialog** (`src/components/points/RedemptionSuccessDialog.tsx`)

Νέο dialog που εμφανίζει:
- ✅ Reward Code (με Copy button)
- ✅ Reward Name
- ✅ Instructions
- ✅ Points Spent
- ✅ Expiry Date
- ✅ Status Badge

---

## 🔧 Τι χρειάζεται (Backend)

### **1. Database Changes**

```sql
-- Προσθήκη columns στον πίνακα memberships
ALTER TABLE memberships
ADD COLUMN bonus_sessions INTEGER DEFAULT 0;

ALTER TABLE memberships
ADD COLUMN bonus_sessions_used INTEGER DEFAULT 0;

-- Index για performance
CREATE INDEX idx_memberships_bonus_sessions ON memberships(user_id, bonus_sessions);
```

### **2. Loyalty Redemption Logic** (`app/Http/Controllers/LoyaltyController.php`)

Στο `redeemReward()` method, όταν εξαργυρώνεται `free_session`:

```php
public function redeemReward(Request $request, $rewardId)
{
    // ... existing validation code ...

    $reward = LoyaltyReward::findOrFail($rewardId);

    // ... existing redemption code ...

    // ✨ NEW: If reward is free_session, add bonus session
    if ($reward->reward_type === 'free_session') {
        $this->addBonusSession($userId);
    }

    // ... rest of redemption code ...
}

protected function addBonusSession($userId)
{
    $membership = Membership::where('user_id', $userId)
        ->where('status', 'active')
        ->orderBy('created_at', 'desc')
        ->first();

    if ($membership) {
        $membership->increment('bonus_sessions');

        \Log::info("Bonus session added", [
            'user_id' => $userId,
            'membership_id' => $membership->id,
            'new_bonus_total' => $membership->bonus_sessions
        ]);
    }
}
```

### **3. Membership API Response** (`app/Http/Controllers/MembershipController.php`)

Ενημέρωσε το response να περιλαμβάνει bonus sessions:

```php
public function getActiveMembership($userId)
{
    $membership = Membership::where('user_id', $userId)
        ->where('status', 'active')
        ->first();

    if (!$membership) {
        return response()->json(['success' => false, 'message' => 'No active membership']);
    }

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $membership->id,
            'membership_type' => $membership->membership_type,
            'total_sessions' => $membership->total_sessions,
            'remaining_sessions' => $membership->remaining_sessions,
            'used_sessions' => $membership->used_sessions,
            'bonus_sessions' => $membership->bonus_sessions,              // ✨ NEW
            'bonus_sessions_used' => $membership->bonus_sessions_used,    // ✨ NEW
            'status' => $membership->status,
            // ... other fields ...
        ]
    ]);
}
```

### **4. Booking Priority Logic** (`app/Http/Controllers/BookingController.php`)

Όταν γίνεται κράτηση, πρώτα να καταναλώνει τα bonus sessions:

```php
public function createBooking(Request $request)
{
    // ... existing validation code ...

    $membership = Membership::where('user_id', $userId)
        ->where('status', 'active')
        ->first();

    if (!$membership) {
        return response()->json(['success' => false, 'message' => 'No active membership']);
    }

    // ✨ NEW: Prioritize bonus sessions
    if ($membership->bonus_sessions > $membership->bonus_sessions_used) {
        // Use bonus session
        $membership->increment('bonus_sessions_used');

        \Log::info("Bonus session consumed", [
            'user_id' => $userId,
            'bonus_sessions_remaining' => $membership->bonus_sessions - $membership->bonus_sessions_used
        ]);
    } elseif ($membership->remaining_sessions > 0) {
        // Use regular session
        $membership->decrement('remaining_sessions');
        $membership->increment('used_sessions');
    } else {
        return response()->json(['success' => false, 'message' => 'No sessions remaining']);
    }

    // ... rest of booking code ...
}
```

---

## 🎯 Πώς θα λειτουργεί

### **User Flow:**

1. **User εξαργυρώνει "Δωρεάν Προπόνηση" (50 πόντοι)**
   ```
   Backend: bonus_sessions = 1
   Frontend: Shows "8+1" in badge
   ```

2. **User κάνει κράτηση μαθήματος**
   ```
   Priority:
   1. Check bonus_sessions_used < bonus_sessions → Use bonus
   2. Else check remaining_sessions > 0 → Use regular
   3. Else → Error "No sessions remaining"
   ```

3. **Session Count Display:**
   ```
   Before booking: "Πραγματοποιήθηκαν 0/8+1"
   After 1st booking (uses bonus): "Πραγματοποιήθηκαν 0/8" (bonus used)
   After 2nd booking: "Πραγματοποιήθηκαν 1/8"
   ```

### **Display Examples:**

| Scenario | Display |
|----------|---------|
| 8 regular, 0 bonus, 0 used | `Πραγματοποιήθηκαν 0/8` |
| 8 regular, 1 bonus, 0 used | `Πραγματοποιήθηκαν 0/8+1` |
| 8 regular, 1 bonus, 1 bonus used | `Πραγματοποιήθηκαν 0/8` |
| 8 regular, 2 bonus, 1 bonus used | `Πραγματοποιήθηκαν 0/8+1` |
| 8 regular, 1 bonus, 5 regular used | `Πραγματοποιήθηκαν 5/8` (bonus already used) |

---

## 🧪 Testing

### **1. Test Bonus Session Addition**

```sql
-- Δημιούργησε test membership
INSERT INTO memberships (user_id, membership_type, total_sessions, remaining_sessions, status, created_at, updated_at)
VALUES (96, 'Monthly 8x', 8, 8, 'active', datetime('now'), datetime('now'));

-- Εξαργύρωσε free_session reward
-- (Μέσω UI: /points/rewards → "Δωρεάν Προπόνηση")

-- Έλεγξε ότι προστέθηκε bonus session
SELECT id, user_id, total_sessions, remaining_sessions, bonus_sessions, bonus_sessions_used
FROM memberships
WHERE user_id = 96;

-- Expected:
-- bonus_sessions = 1
-- bonus_sessions_used = 0
```

### **2. Test Booking Priority**

```sql
-- Κάνε κράτηση μαθήματος
-- (Μέσω UI: BookingWizard → Select class → Book)

-- Έλεγξε ότι καταναλώθηκε πρώτα το bonus
SELECT id, user_id, total_sessions, remaining_sessions, bonus_sessions, bonus_sessions_used
FROM memberships
WHERE user_id = 96;

-- Expected after 1st booking:
-- remaining_sessions = 8 (unchanged)
-- bonus_sessions_used = 1 (incremented)
```

### **3. Test UI Display**

1. **Before Redemption:**
   - Go to Dashboard
   - Check badge: Should show "Πραγματοποιήθηκαν 0/8"

2. **After Redemption:**
   - Redeem "Δωρεάν Προπόνηση"
   - Refresh Dashboard
   - Check badge: Should show "Πραγματοποιήθηκαν 0/8+1"

3. **After Booking:**
   - Book a class
   - Check badge: Should show "Πραγματοποιήθηκαν 0/8" (bonus consumed)

---

## 📝 SQL Queries για Manual Testing

### **Give Test Points:**
```sql
INSERT INTO loyalty_points (user_id, amount, type, source, description, balance_after, expires_at, created_at, updated_at)
VALUES (96, 100, 'earned', 'manual', 'Test points', 100, datetime('now', '+1 year'), datetime('now'), datetime('now'));
```

### **Create Free Session Reward:**
```sql
INSERT INTO loyalty_rewards (name, description, points_cost, reward_type, reward_value, is_active, created_at, updated_at)
VALUES ('Δωρεάν Προπόνηση', 'Μια δωρεάν προπόνηση της επιλογής σου', 50, 'free_session', '1 session', 1, datetime('now'), datetime('now'));
```

### **Check User State:**
```sql
SELECT
    u.id as user_id,
    u.name,
    m.total_sessions,
    m.remaining_sessions,
    m.bonus_sessions,
    m.bonus_sessions_used,
    (SELECT SUM(amount) FROM loyalty_points WHERE user_id = u.id AND type = 'earned') as total_points
FROM users u
LEFT JOIN memberships m ON u.id = m.user_id AND m.status = 'active'
WHERE u.id = 96;
```

### **View Redemption History:**
```sql
SELECT
    r.id,
    r.user_id,
    r.reward_id,
    lr.name as reward_name,
    lr.reward_type,
    r.points_spent,
    r.reward_code,
    r.status,
    r.created_at
FROM loyalty_redemptions r
JOIN loyalty_rewards lr ON r.reward_id = lr.id
WHERE r.user_id = 96
ORDER BY r.created_at DESC
LIMIT 10;
```

---

## ⚠️ Important Notes

1. **Bonus sessions δεν λήγουν** - Δεν έχουν expiry date
2. **Priority:** Bonus sessions καταναλώνονται ΠΡΩΤΑ
3. **Multiple bonuses:** Μπορεί να έχει πολλαπλά bonus sessions (π.χ. 8+3)
4. **Display logic:** Αν bonus_sessions_used === bonus_sessions, δεν εμφανίζεται το "+X"
5. **Membership renewal:** Τα bonus sessions μεταφέρονται στο νέο membership? (DECIDE)

---

## 🚀 Deployment Checklist

- [ ] Backup database
- [ ] Run migration για bonus_sessions columns
- [ ] Deploy backend code (LoyaltyController, MembershipController, BookingController)
- [ ] Deploy frontend code (already done)
- [ ] Test με test user
- [ ] Verify API responses include bonus fields
- [ ] Test redemption → bonus session addition
- [ ] Test booking → bonus session consumption
- [ ] Monitor logs για errors
- [ ] Announce feature to users

---

**Implementation Status:**
- ✅ Frontend: COMPLETE
- ⏳ Backend: PENDING (requires backend developer)
- ⏳ Testing: PENDING (after backend deployment)
