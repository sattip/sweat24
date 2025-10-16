# Τεχνική Αναφορά: Υλοποίηση EMS στο Ιατρικό Ιστορικό

## 1. Επισκόπηση

Προστέθηκε δυναμική λειτουργία στη φόρμα του ιατρικού ιστορικού για την υποστήριξη προπόνησης με EMS (Electrical Muscle Stimulation). Οι ερωτήσεις και οι αντενδείξεις για το EMS εμφανίζονται μόνο όταν ο χρήστης δηλώσει ενδιαφέρον.

## 2. Frontend Changes

### 2.1 Νέα πεδία στο SignupData interface:
```typescript
// Section 7: EMS Interest
emsInterest: boolean;

// Section 8: EMS Contraindications (only if emsInterest is true)
emsContraindications: {
  [key: string]: {
    hasCondition: boolean;
    yearOfOnset?: string;
  };
};

// Section 8.1: EMS Liability Declaration (only if emsInterest is true)
emsLiabilityAccepted?: boolean;
```

### 2.2 UI Components:
- Checkbox "Ενδιαφέρεστε να κάνετε EMS;" (Section 6)
- Δυναμική εμφάνιση δύο ξεχωριστών λιστών αντενδείξεων μόνο όταν `emsInterest: true`:
  - **Αντενδείξεις για προπόνηση με EMS – Απόλυτες** (14 καταστάσεις)
  - **Αντενδείξεις για προπόνηση με EMS – Σχετικές (με ιατρική συμβουλή)** (14 καταστάσεις)
- Ειδική Υπεύθυνη Δήλωση για EMS με χωριστό checkbox αποδοχής

## 3. Backend Requirements

### 3.1 API Endpoint
- **URL**: `https://sweat93laravel.obs.com.gr/api/v1/medical-history`
- **Method**: POST
- **Authentication**: Bearer Token (Laravel Sanctum)

### 3.2 JSON Payload Structure
```json
{
  "medical_conditions": {
    "Υψηλή αρτηριακή πίεση": {
      "has_condition": true,
      "year_of_onset": "2020",
      "details": "Υπό φαρμακευτική αγωγή"
    }
  },
  "current_health_problems": {
    "has_problems": false,
    "details": ""
  },
  "prescribed_medications": [
    {
      "medication": "Ασπιρίνη",
      "reason": "Καρδιαγγειακή προστασία"
    }
  ],
  "smoking": {
    "currently_smoking": false,
    "daily_cigarettes": null,
    "ever_smoked": true,
    "smoking_years": "10",
    "quit_years_ago": "5"
  },
  "physical_activity": {
    "description": "Περπάτημα",
    "frequency": "3 φορές την εβδομάδα",
    "duration": "30 λεπτά"
  },
  "emergency_contact": {
    "name": "Μαρία Παπαδοπούλου",
    "phone": "6901234567"
  },
  "ems_interest": true,
  "ems_contraindications": {
    "Εγκυμοσύνη": {
      "has_condition": false,
      "year_of_onset": null
    },
    "Βηματοδότης": {
      "has_condition": true,
      "year_of_onset": "2021"
    }
  },
  "ems_liability_accepted": true,
  "liability_declaration_accepted": true,
  "submitted_at": "2025-08-05T12:00:00.000Z"
}
```

### 3.3 Λίστα Αντενδείξεων EMS

#### 3.3.1 Αντενδείξεις για προπόνηση με EMS – Απόλυτες
1. Βηματοδότης
2. Εγκυμοσύνη
3. Πυρετός, οξείες βακτηριακές ή ιογενείς λοιμώξεις
4. Θρόμβωση / Θρομβοφλεβίτιδα
5. Stent ή Bypass (εντός τελευταίων 6 μηνών)
6. Αρτηριοσκλήρωση σε προχωρημένο στάδιο
7. Υψηλή αρτηριακή πίεση (χωρίς ιατρικό έλεγχο)
8. Αιμορραγικές διαταραχές
9. Νεοπλασματικές ασθένειες (όγκοι – καρκίνος)
10. Οξεία αρθρίτιδα
11. Νευρολογικές ασθένειες
12. Προοδευτική μυϊκή δυστροφία
13. Κήλες κοιλιακού τοιχώματος ή βουβωνοκήλες
14. Λεμφοίδημα

#### 3.3.2 Αντενδείξεις για προπόνηση με EMS – Σχετικές (με ιατρική συμβουλή)
1. Καρδιολογικές παθήσεις
2. Καρδιακές αρρυθμίες
3. Σακχαρώδης διαβήτης τύπου I
4. Επιληψία (κατά περίπτωση)
5. Πρόσφατες επεμβάσεις (6–8 μήνες)
6. Ασκίτης, πνευμονικά ή πλευρικά υγρά
7. Δερματοπάθειες
8. Οξύς μη διαγνωσμένος πόνος στη μέση
9. Οξεία νευραλγία / οξεία κήλη δίσκου
10. Κήροι (αποφυγή περιοχής)
11. Εσωτερικές παθήσεις οργάνων (π.χ. νεφρά)
12. Φαρμακευτική αγωγή
13. Πρόσφατες φλεγμονές ή τραυματισμοί
14. Έγκαυμα από τον ήλιο

## 4. Database Schema

### 4.1 Προτεινόμενη δομή πίνακα `medical_histories`
```sql
-- Υπάρχοντα πεδία
medical_conditions JSON,
current_health_problems JSON,
prescribed_medications JSON,
smoking JSON,
physical_activity JSON,
emergency_contact JSON,
liability_declaration_accepted BOOLEAN,
submitted_at TIMESTAMP,

-- Νέα πεδία για EMS
ems_interest BOOLEAN DEFAULT FALSE,
ems_contraindications JSON NULL,
ems_liability_accepted BOOLEAN NULL
```

### 4.2 Παράδειγμα αποθήκευσης
Το πεδίο `ems_contraindications` θα είναι:
- `NULL` αν `ems_interest = false`
- JSON object με τις αντενδείξεις αν `ems_interest = true`

## 5. Admin Panel Requirements

### 5.1 Εμφάνιση Δεδομένων

#### 5.1.1 Λίστα Χρηστών
Προσθήκη στήλης "EMS" με ένδειξη:
- ✅ Ενδιαφέρεται για EMS (χωρίς αντενδείξεις)
- ⚠️ Ενδιαφέρεται για EMS (με αντενδείξεις)
- ❌ Δεν ενδιαφέρεται για EMS

#### 5.1.2 Λεπτομέρειες Χρήστη
Νέα ενότητα "EMS Status":
```
EMS Status
----------
Ενδιαφέρον για EMS: Ναι/Όχι

[Αν Ναι]
Αντενδείξεις:
- Βηματοδότης/απινιδωτής (Έτος: 2021)
- Υψηλή αρτηριακή πίεση (Έτος: 2020)
```

### 5.2 Φίλτρα Αναζήτησης
- Φίλτρο "EMS Interest" (All/Yes/No)
- Φίλτρο "Has EMS Contraindications" (All/Yes/No)

### 5.3 Εξαγωγή Αναφορών
Προσθήκη στις αναφορές:
- Σύνολο μελών με ενδιαφέρον για EMS
- Σύνολο μελών με αντενδείξεις για EMS
- Λίστα συχνότερων αντενδείξεων

## 6. Validation Rules

### 6.1 Frontend Validation
- Τα πεδία EMS contraindications είναι υποχρεωτικά ΜΟΝΟ αν `emsInterest === true`
- Το checkbox της υπεύθυνης δήλωσης EMS είναι υποχρεωτικό ΜΟΝΟ αν `emsInterest === true`
- Έτος έναρξης: 1900 - τρέχον έτος

### 6.2 Backend Validation
```php
$rules = [
    'ems_interest' => 'required|boolean',
    'ems_contraindications' => 'required_if:ems_interest,true|nullable|array',
    'ems_contraindications.*.has_condition' => 'required|boolean',
    'ems_contraindications.*.year_of_onset' => 'nullable|integer|min:1900|max:' . date('Y'),
    'ems_liability_accepted' => 'required_if:ems_interest,true|nullable|boolean'
];
```

## 7. Migration Example

```php
Schema::table('medical_histories', function (Blueprint $table) {
    $table->boolean('ems_interest')->default(false)->after('emergency_contact');
    $table->json('ems_contraindications')->nullable()->after('ems_interest');
    $table->boolean('ems_liability_accepted')->nullable()->after('ems_contraindications');
});
```

## 8. API Response

Επιτυχής υποβολή:
```json
{
  "success": true,
  "message": "Το ιατρικό ιστορικό υποβλήθηκε επιτυχώς",
  "data": {
    "id": 123,
    "user_id": 456,
    "ems_interest": true,
    "has_ems_contraindications": true,
    "active_conditions_count": 2
  }
}
```

## 9. Σημειώσεις Υλοποίησης

1. **Conditional Rendering**: Τα πεδία EMS εμφανίζονται μόνο όταν το checkbox είναι τσεκαρισμένο
2. **Διαχωρισμός Αντενδείξεων**: Οι αντενδείξεις χωρίζονται σε δύο κατηγορίες - Απόλυτες και Σχετικές
3. **Ειδική Υπεύθυνη Δήλωση**: Υπάρχει ξεχωριστή υπεύθυνη δήλωση για EMS με δικό της checkbox
4. **Data Persistence**: Αν ο χρήστης ξε-τσεκάρει το EMS interest, τα δεδομένα των αντενδείξεων διατηρούνται στο frontend αλλά δεν στέλνονται στο backend
5. **Validation Flow**: Η διαδικασία δεν μπορεί να συνεχίσει αν έχει επιλεγεί EMS αλλά δεν έχει γίνει αποδοχή της ειδικής υπεύθυνης δήλωσης

## 10. Testing Scenarios

1. Χρήστης χωρίς ενδιαφέρον για EMS
2. Χρήστης με ενδιαφέρον για EMS χωρίς αντενδείξεις
3. Χρήστης με ενδιαφέρον για EMS με απόλυτες αντενδείξεις
4. Χρήστης με ενδιαφέρον για EMS με σχετικές αντενδείξεις
5. Χρήστης με ενδιαφέρον για EMS αλλά χωρίς αποδοχή της υπεύθυνης δήλωσης (validation error)
6. Toggle on/off του EMS interest και έλεγχος validation
7. Έλεγχος αποθήκευσης και ανάκτησης δεδομένων

---

**Ημερομηνία Σύνταξης**: 5 Αυγούστου 2025  
**Συντάκτης**: AI Assistant για sweat93 Client App