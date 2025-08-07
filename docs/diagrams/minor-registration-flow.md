# Minor Registration Flow - Sequence Diagram

Αυτό το διάγραμμα δείχνει τη ροή για την εγγραφή ανηλίκων με έλεγχο ηλικίας στον server.

```mermaid
sequenceDiagram
    participant U as Χρήστης
    participant F as Frontend
    participant B as Backend API
    participant DB as Database
    
    U->>F: Συμπληρώνει βασικά στοιχεία
    F->>F: Validation πεδίων
    F->>B: POST /api/v1/auth/check-age<br/>{birth_date: "2010-05-15"}
    B->>B: Υπολογισμός ηλικίας με<br/>server timestamp
    B->>DB: Log age verification
    B-->>F: {is_minor: true, age: 15,<br/>server_date: "2025-08-05"}
    
    alt Ανήλικος (< 18)
        F->>U: Εμφάνιση φόρμας γονέα
        U->>F: Συμπληρώνει στοιχεία γονέα
        U->>F: Ψηφιακή υπογραφή
        F->>F: Validation parent consent
    else Ενήλικας (>= 18)
        F->>U: Απευθείας στο ιατρικό ιστορικό
    end
    
    U->>F: Συμπληρώνει ιατρικό ιστορικό
    F->>B: POST /api/v1/auth/register<br/>{...userData, parentConsent: {...}}
    B->>DB: Create user record
    B->>DB: Save parent consent (if minor)
    B-->>F: Success response
    F->>U: Επιτυχής εγγραφή
```

## Κρίσιμα Σημεία:

1. **Server-side Age Verification**: Ο έλεγχος ηλικίας γίνεται στον server για νομική εγκυρότητα
2. **Audit Trail**: Κάθε έλεγχος ηλικίας καταγράφεται στη βάση
3. **Conditional Flow**: Η ροή αλλάζει δυναμικά ανάλογα με την ηλικία
4. **Parent Consent**: Υποχρεωτική συγκατάθεση γονέα για ανήλικους