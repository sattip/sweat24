# Τεχνική Αναφορά: Ολοκληρωμένη Υλοποίηση Εγγραφής Ανηλίκων

**⚠️ ΚΡΙΣΙΜΗ ΝΟΜΙΚΗ ΔΙΕΥΚΡΙΝΙΣΗ**: Ο έλεγχος ηλικίας ΠΡΕΠΕΙ να γίνεται στον server και η επίσημη ημερομηνία υποβολής ΠΡΕΠΕΙ να είναι η τρέχουσα ημερομηνία του server για λόγους νομικής εγκυρότητας και ακεραιότητας των δεδομένων.

## 1. Επισκόπηση Υλοποίησης

Η διαδικασία εγγραφής ανηλίκων έχει υλοποιηθεί με ασφαλή επικοινωνία με το backend. Η τοπική λογική ελέγχου ηλικίας έχει αντικατασταθεί με API calls που διασφαλίζουν την ακεραιότητα και νομική εγκυρότητα των δεδομένων.

### Ροή Διαδικασίας:
1. Ο χρήστης συμπληρώνει τα βασικά στοιχεία (όνομα, email, ημερομηνία γέννησης)
2. Το frontend στέλνει την ημερομηνία γέννησης στο backend για έλεγχο
3. Το backend επιστρέφει αν ο χρήστης είναι ανήλικος
4. Αν είναι ανήλικος, εμφανίζεται φόρμα συγκατάθεσης γονέα
5. Μετά τη συγκατάθεση, συνεχίζει με το ιατρικό ιστορικό
6. Τέλος, όλα τα δεδομένα υποβάλλονται μαζί στο backend

## 2. Backend API Requirements

### 2.1 Age Verification Endpoint

**Endpoint**: `POST /api/v1/auth/check-age`

**Description**: Ελέγχει αν ο χρήστης είναι ανήλικος βάσει της ημερομηνίας γέννησης

**Authentication**: Δεν απαιτείται (public endpoint)

**Request Headers**:
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Request Body**:
```json
{
  "birth_date": "2010-05-15"
}
```

**Success Response** (200 OK):
```json
{
  "is_minor": true,
  "age": 15,
  "server_date": "2025-08-05"
}
```

**Error Response** (400 Bad Request):
```json
{
  "message": "Invalid birth date format",
  "errors": {
    "birth_date": ["The birth date field must be a valid date."]
  }
}
```

**Implementation Notes**:
- Η ημερομηνία γέννησης πρέπει να είναι σε format YYYY-MM-DD
- Ο υπολογισμός ηλικίας ΠΡΕΠΕΙ να γίνεται με βάση την ημερομηνία του SERVER, όχι του client
- Το `server_date` στο response χρησιμεύει για audit trail

### 2.2 Registration Endpoint (Updated)

**Endpoint**: `POST /api/v1/auth/register`

**Description**: Εγγραφή νέου χρήστη με υποστήριξη για ανήλικους

**Request Body για Ανήλικο**:
```json
{
  "firstName": "Γιάννης",
  "lastName": "Παπαδόπουλος",
  "email": "giannis@example.com",
  "password": "password123",
  "birthDate": "2010-05-15",
  "gender": "male",
  "phone": "6901234567",
  "signature": "data:image/png;base64,...",
  "signedAt": "2025-08-05T12:00:00.000Z",
  "documentType": "terms_and_conditions",
  "documentVersion": "1.0",
  "medicalHistory": {
    "medical_conditions": { ... },
    "current_health_problems": { ... },
    "prescribed_medications": [ ... ],
    "smoking": { ... },
    "physical_activity": { ... },
    "emergency_contact": { ... },
    "ems_interest": false,
    "liability_declaration_accepted": true,
    "submitted_at": "2025-08-05T12:00:00.000Z"
  },
  "parentConsent": {
    "parentFullName": "Νικόλαος Παπαδόπουλος",
    "fatherFirstName": "Νικόλαος",
    "fatherLastName": "Παπαδόπουλος",
    "motherFirstName": "Μαρία",
    "motherLastName": "Γεωργίου",
    "parentBirthDate": "1980-03-20",
    "parentIdNumber": "ΑΒ123456",
    "parentPhone": "6909876543",
    "parentLocation": "Αθήνα",
    "parentStreet": "Πανεπιστημίου",
    "parentStreetNumber": "42",
    "parentPostalCode": "10434",
    "parentEmail": "parent@example.com",
    "consentAccepted": true,
    "signature": "data:image/png;base64,..."
  }
}
```

**Validation Rules για Ανήλικους**:
```php
if ($request->has('parentConsent')) {
    $rules['parentConsent'] = 'required|array';
    $rules['parentConsent.parentFullName'] = 'required|string|max:255';
    $rules['parentConsent.fatherFirstName'] = 'required|string|max:100';
    $rules['parentConsent.fatherLastName'] = 'required|string|max:100';
    $rules['parentConsent.motherFirstName'] = 'required|string|max:100';
    $rules['parentConsent.motherLastName'] = 'required|string|max:100';
    $rules['parentConsent.parentBirthDate'] = 'required|date|before:' . now()->subYears(18);
    $rules['parentConsent.parentIdNumber'] = 'required|string|max:20|unique:parent_consents,parent_id_number';
    $rules['parentConsent.parentPhone'] = 'required|string|max:20';
    $rules['parentConsent.parentLocation'] = 'required|string|max:100';
    $rules['parentConsent.parentStreet'] = 'required|string|max:255';
    $rules['parentConsent.parentStreetNumber'] = 'required|string|max:20';
    $rules['parentConsent.parentPostalCode'] = 'required|string|size:5';
    $rules['parentConsent.parentEmail'] = 'required|email|max:255';
    $rules['parentConsent.consentAccepted'] = 'required|boolean|accepted';
    $rules['parentConsent.signature'] = 'required|string|starts_with:data:image';
}
```

## 3. Database Schema

### 3.1 Users Table Update

```sql
ALTER TABLE users ADD COLUMN is_minor BOOLEAN DEFAULT FALSE AFTER gender;
ALTER TABLE users ADD COLUMN age_at_registration INT AFTER is_minor;
ALTER TABLE users ADD INDEX idx_is_minor (is_minor);
```

### 3.2 Parent Consents Table

```sql
CREATE TABLE parent_consents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    parent_full_name VARCHAR(255) NOT NULL,
    father_first_name VARCHAR(100) NOT NULL,
    father_last_name VARCHAR(100) NOT NULL,
    mother_first_name VARCHAR(100) NOT NULL,
    mother_last_name VARCHAR(100) NOT NULL,
    parent_birth_date DATE NOT NULL,
    parent_id_number VARCHAR(20) NOT NULL UNIQUE,
    parent_phone VARCHAR(20) NOT NULL,
    parent_location VARCHAR(100) NOT NULL,
    parent_street VARCHAR(255) NOT NULL,
    parent_street_number VARCHAR(20) NOT NULL,
    parent_postal_code VARCHAR(10) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    consent_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    signature LONGTEXT NOT NULL,
    consent_text TEXT NOT NULL,
    consent_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    server_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_parent_id_number (parent_id_number),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 Age Verification Logs Table (για audit trail)

```sql
CREATE TABLE age_verification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    birth_date DATE NOT NULL,
    calculated_age INT NOT NULL,
    is_minor BOOLEAN NOT NULL,
    server_date DATE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 4. Admin Panel Requirements

### 4.1 Users List View

#### 4.1.1 Νέες Στήλες
- **Ηλικία**: Εμφάνιση badge με την ηλικία εγγραφής
- **Κατάσταση**: Badge "Ανήλικος" με κόκκινο χρώμα για is_minor = true
- **Γονέας**: Εικονίδιο που δείχνει αν υπάρχει συγκατάθεση γονέα

#### 4.1.2 Φίλτρα
```php
// Νέα φίλτρα στη λίστα χρηστών
- Ηλικιακή Ομάδα: Όλοι | Ενήλικες | Ανήλικοι
- Με Συγκατάθεση Γονέα: Ναι | Όχι
- Ηλικία Εγγραφής: Range slider (π.χ. 14-25)
```

### 4.2 User Details View

#### 4.2.1 Νέο Tab "Στοιχεία Γονέα/Κηδεμόνα"
Εμφανίζεται ΜΟΝΟ για χρήστες με is_minor = true

```
┌─────────────────────────────────────────────────────────┐
│ ΣΤΟΙΧΕΙΑ ΓΟΝΕΑ/ΚΗΔΕΜΟΝΑ                                │
├─────────────────────────────────────────────────────────┤
│ Ονοματεπώνυμο: Νικόλαος Παπαδόπουλος                   │
│ Πατέρας: Νικόλαος Παπαδόπουλος                          │
│ Μητέρα: Μαρία Γεωργίου                                  │
│ Ημ. Γέννησης Γονέα: 20/03/1980                         │
│ ΑΔΤ: ΑΒ123456                                          │
│ Τηλέφωνο: 6909876543                                    │
│ Email: parent@example.com                               │
│ Διεύθυνση: Πανεπιστημίου 42, 10434 Αθήνα               │
│                                                         │
│ Ημ/νία Συγκατάθεσης: 05/08/2025 14:32:15              │
│ [Προβολή Υπογραφής]                                     │
└─────────────────────────────────────────────────────────┘
```

#### 4.2.2 Modal Προβολής Υπογραφής
```html
<div class="modal">
  <h3>Υπογραφή Γονέα/Κηδεμόνα</h3>
  <img src="[base64 signature data]" class="signature-preview" />
  <p>Υπογράφηκε: 05/08/2025 14:32:15</p>
  <button onclick="downloadSignature()">Λήψη Υπογραφής</button>
</div>
```

### 4.3 Reports & Analytics

#### 4.3.1 Νέες Αναφορές
1. **Ηλικιακή Κατανομή Μελών**
   - Pie chart με ηλικιακές ομάδες
   - Ξεχωριστή κατηγορία για ανήλικους

2. **Αναφορά Ανήλικων Μελών**
   ```
   Σύνολο Ανήλικων: 45
   Με Συγκατάθεση: 45
   Ηλικίες: 14-17
   Μέση Ηλικία: 16.2
   ```

3. **Export Στοιχείων Γονέων**
   - CSV export με στοιχεία επικοινωνίας γονέων
   - Φιλτράρισμα ανά περίοδο εγγραφής

### 4.4 Ειδοποιήσεις & Alerts

```php
// Ειδοποίηση όταν ανήλικος πλησιάζει τα 18
if ($user->age_at_registration < 18) {
    $currentAge = Carbon::parse($user->birthDate)->age;
    if ($currentAge >= 17.5) {
        Notification::send($admins, new MinorApproachingAdulthood($user));
    }
}
```

## 5. Security & Legal Compliance

### 5.1 Ασφάλεια Δεδομένων

1. **Encryption**: Όλες οι υπογραφές πρέπει να κρυπτογραφούνται στη βάση
2. **Access Control**: Μόνο admins με ειδικά δικαιώματα βλέπουν στοιχεία γονέων
3. **Audit Trail**: Κάθε προβολή στοιχείων γονέα καταγράφεται

### 5.2 GDPR Compliance

1. **Data Retention**: Στοιχεία γονέων διατηρούνται μέχρι ο χρήστης να γίνει 18 + 1 έτος
2. **Right to be Forgotten**: Διαγραφή χρήστη διαγράφει και τα στοιχεία γονέα
3. **Data Portability**: Export δεδομένων περιλαμβάνει και στοιχεία γονέα

### 5.3 Νομική Εγκυρότητα

**⚠️ ΚΡΙΣΙΜΟ**: 
- Όλες οι ημερομηνίες ΠΡΕΠΕΙ να καταγράφονται από τον SERVER
- Το field `server_timestamp` στον πίνακα `parent_consents` είναι το νομικά έγκυρο
- ΠΟΤΕ μην εμπιστεύεστε timestamps από το client

## 6. Implementation Timeline

### Phase 1: Backend API (Άμεση Προτεραιότητα)
1. Implement `/auth/check-age` endpoint
2. Update registration endpoint για ανήλικους
3. Create database migrations

### Phase 2: Admin Panel
1. Update users list με νέες στήλες
2. Add parent consent tab
3. Implement reports

### Phase 3: Testing & Deployment
1. Unit tests για age calculation
2. Integration tests για registration flow
3. Security audit

## 7. Testing Checklist

### 7.1 API Tests
- [ ] Age verification για διάφορες ημερομηνίες
- [ ] Registration ενήλικα (normal flow)
- [ ] Registration ανηλίκου με parent consent
- [ ] Registration ανηλίκου χωρίς parent consent (πρέπει να αποτύχει)
- [ ] Οριακές περιπτώσεις (γενέθλια σήμερα, χθες, αύριο)

### 7.2 Security Tests
- [ ] Manipulation της ημερομηνίας από client
- [ ] SQL injection στα parent consent fields
- [ ] XSS στις υπογραφές
- [ ] File size limits για signatures

### 7.3 Admin Panel Tests
- [ ] Φίλτρα λειτουργούν σωστά
- [ ] Export περιλαμβάνει όλα τα δεδομένα
- [ ] Permissions για προβολή στοιχείων γονέων

## 8. Monitoring & Alerts

### 8.1 Logs to Monitor
```php
// Log every age verification
Log::info('age_verification', [
    'birth_date' => $request->birth_date,
    'calculated_age' => $age,
    'is_minor' => $isMinor,
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent()
]);
```

### 8.2 Alerts
- Unusual number of minor registrations
- Failed parent consent validations
- Attempts to bypass age verification

## 9. Rollback Plan

Σε περίπτωση προβλήματος:
1. Disable age verification endpoint
2. Revert to manual approval για ανήλικους
3. Keep parent consent data για manual processing

---

**Ημερομηνία Σύνταξης**: 5 Αυγούστου 2025  
**Συντάκτης**: AI Assistant για sweat93 Client App  
**Status**: Production Ready  
**Priority**: HIGH - Νομική Συμμόρφωση