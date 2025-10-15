# 🔥 REFERRAL SYSTEM - Backend Implementation Requirements

## 🎯 **ΕΠΕΙΓΟΝ: Missing API Endpoints**

Η εφαρμογή **αποτυγχάνει** στο referral system γιατί **λείπουν τα παρακάτω endpoints** από το backend:

---

## 📡 **1. PHONE SEARCH ENDPOINT**

### **Endpoint:** `GET /api/v1/users/search-by-phone`

**Τι κάνει:** Αναζητά χρήστη με βάση το κινητό τηλέφωνο για referral validation.

### **Request:**
```
GET https://api.sweat93.gr/api/v1/users/search-by-phone?phone=6986269385
```

### **Response Format:**
```json
{
  "user": {
    "id": 3,
    "name": "Νίκος Αντωνίου",
    "email": "nikos@example.com", 
    "phone": "6986269385"
  }
}
```

**Αν δεν βρεθεί:**
```json
{
  "user": null
}
```

### **PHP Implementation (Laravel):**

```php
// UserController.php - προσθήκη method:

public function searchByPhone(Request $request)
{
    $phone = $request->input('phone');
    
    if (empty($phone) || strlen($phone) < 10) {
        return response()->json(['user' => null]);
    }
    
    // Αναζήτηση με normalization (αφαίρεση κενών/παύλων)
    $cleanPhone = preg_replace('/[\s\-\(\)]/', '', $phone);
    
    $user = User::where(function($query) use ($phone, $cleanPhone) {
        $query->where('phone', $phone)
              ->orWhere('phone', $cleanPhone)
              ->orWhere(DB::raw("REPLACE(REPLACE(phone, ' ', ''), '-', '')"), $cleanPhone);
    })
    ->where('status', 'active')
    ->select('id', 'name', 'email', 'phone')
    ->first();
    
    return response()->json(['user' => $user]);
}
```

### **Route:**
```php
// routes/api.php - προσθήκη:
Route::get('/users/search-by-phone', [UserController::class, 'searchByPhone']);
```

---

## 🗄️ **2. DATABASE CHANGES**

### **Προσθήκη στηλών στον πίνακα `users`:**

```sql
-- Εκτέλεση αυτών των SQL commands:
ALTER TABLE users ADD COLUMN referral_phone VARCHAR(20) NULL COMMENT 'Κινητό συστήσαντος';
ALTER TABLE users ADD COLUMN referrer_id INT NULL COMMENT 'ID συστήσαντος χρήστη';  
ALTER TABLE users ADD COLUMN found_us_via VARCHAR(50) NULL COMMENT 'Πώς βρήκε την επιχείρηση';
ALTER TABLE users ADD COLUMN referral_points INT DEFAULT 0 COMMENT 'Πόντοι από συστάσεις';

-- Foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_referrer 
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL;

-- Indexes για performance  
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referrer_id ON users(referrer_id);
```

---

## 📝 **3. USER REGISTRATION UPDATE**

### **Ενημέρωση του Registration endpoint:**

Το `POST /api/v1/users` (ή `/auth/register-with-consent`) πρέπει να δέχεται τα εξής **νέα πεδία**:

```json
{
  "firstName": "Μαρία",
  "lastName": "Κωνσταντίνου",
  "email": "maria@example.com", 
  "phone": "6987654321",
  "password": "password123",
  "password_confirmation": "password123",
  
  // ΝΕΑ ΠΕΔΙΑ:
  "found_us_via": "referral",
  "referral_source": "friend", 
  "referral_phone": "6986269385",
  "referrer_id": 3
}
```

### **PHP Implementation Update:**

```php
// UserController@store ή AuthController@register - ενημέρωση:

public function store(Request $request)
{
    $validated = $request->validate([
        // Υπάρχοντα πεδία...
        'firstName' => 'required|string|max:255',
        'lastName' => 'required|string|max:255', 
        'email' => 'required|email|unique:users',
        'phone' => 'required|string|max:20',
        'password' => 'required|min:8|confirmed',
        
        // ΝΕΑ ΠΕΔΙΑ για referral:
        'found_us_via' => 'nullable|string',
        'referral_source' => 'nullable|string', 
        'referral_phone' => 'nullable|string|max:20',
        'referrer_id' => 'nullable|integer|exists:users,id',
    ]);

    // Δημιουργία χρήστη με τα νέα πεδία
    $user = User::create([
        'name' => $validated['firstName'] . ' ' . $validated['lastName'],
        'first_name' => $validated['firstName'],
        'last_name' => $validated['lastName'], 
        'email' => $validated['email'],
        'phone' => $validated['phone'],
        'password' => Hash::make($validated['password']),
        
        // ΝΕΑ ΠΕΔΙΑ:
        'found_us_via' => $validated['found_us_via'],
        'referral_phone' => $validated['referral_phone'], 
        'referrer_id' => $validated['referrer_id'],
        'status' => 'pending_approval',
    ]);

    // 🏆 REWARD POINTS: +50 πόντοι στον referrer
    if (!empty($validated['referrer_id'])) {
        $referrer = User::find($validated['referrer_id']);
        if ($referrer) {
            $referrer->increment('referral_points', 50);
        }
    }

    return response()->json(['user' => $user], 201);
}
```

---

## 📊 **4. REFERRAL ANALYTICS ENDPOINT (Optional)**

### **Endpoint:** `GET /api/v1/users/{id}/referrals`

```php
public function getUserReferrals($userId)
{
    $user = User::findOrFail($userId);
    
    $referredUsers = User::where('referrer_id', $userId)
        ->select('id', 'name', 'email', 'phone', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();
    
    $totalReferrals = $referredUsers->count();
    $totalPoints = $totalReferrals * 50;
    
    return response()->json([
        'total_referrals' => $totalReferrals,
        'total_points' => $totalPoints, 
        'referred_users' => $referredUsers
    ]);
}
```

---

## 🧪 **5. TESTING**

### **Test το Phone Search:**
```bash
curl "https://api.sweat93.gr/api/v1/users/search-by-phone?phone=6986269385"
```

**Expected Response:**
```json
{
  "user": {
    "id": 3,
    "name": "Νίκος Αντωνίου", 
    "email": "nikos@example.com",
    "phone": "6986269385"
  }
}
```

### **Test το Registration με Referral:**
```bash
curl -X POST "https://api.sweat93.gr/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "phone": "6900000000",
    "password": "password123",
    "password_confirmation": "password123",
    "found_us_via": "referral",
    "referral_phone": "6986269385", 
    "referrer_id": 3
  }'
```

---

## ⚡ **6. PRIORITY IMPLEMENTATION**

### **Ελάχιστα απαιτούμενα για να δουλέψει η εφαρμογή:**

1. ✅ **Database Changes** (5 λεπτά)
2. ✅ **Phone Search Endpoint** (10 λεπτά)  
3. ✅ **Registration Update** (10 λεπτά)

**Συνολικός χρόνος: ~25 λεπτά**

---

## 🚨 **CURRENT STATUS**

**❌ Τι δεν δουλεύει τώρα:**
- `/users/search-by-phone` → `404 Not Found`
- Registration δεν αποθηκεύει referral data
- Δεν υπάρχουν οι νέες στήλες στη βάση

**✅ Τι θα δουλέψει μετά την υλοποίηση:**
- Real-time phone search στο signup
- Automatic referrer detection  
- Referral points system
- Complete referral analytics

---

## 📋 **IMPLEMENTATION CHECKLIST**

- [ ] **Database**: Προσθήκη νέων στηλών
- [ ] **API**: Phone search endpoint
- [ ] **API**: Registration update για referral data  
- [ ] **Testing**: Verification των endpoints
- [ ] **Deploy**: Push στο production

**🎯 Αυτά τα 3 βήματα θα κάνουν το referral system να δουλέψει πλήρως!**

---

## 💡 **MIGRATION SCRIPT**

```php
// database/migrations/xxxx_add_referral_fields_to_users.php

public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('referral_phone', 20)->nullable()->comment('Κινητό συστήσαντος');
        $table->unsignedBigInteger('referrer_id')->nullable()->comment('ID συστήσαντος χρήστη');
        $table->string('found_us_via', 50)->nullable()->comment('Πώς βρήκε την επιχείρηση');
        $table->integer('referral_points')->default(0)->comment('Πόντοι από συστάσεις');
        
        $table->foreign('referrer_id')->references('id')->on('users')->onDelete('set null');
        $table->index('phone');
        $table->index('referrer_id');
    });
}
```

**Execute:**
```bash
php artisan make:migration add_referral_fields_to_users
php artisan migrate
```
