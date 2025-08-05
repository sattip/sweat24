# Minor Registration Database Schema

Αυτό το διάγραμμα δείχνει τη δομή της βάσης δεδομένων για την εγγραφή ανηλίκων.

```mermaid
erDiagram
    users ||--o| parent_consents : has
    users ||--o| age_verification_logs : generates
    users ||--|| medical_histories : has
    
    users {
        int id PK
        string firstName
        string lastName
        string email
        date birthDate
        boolean is_minor
        int age_at_registration
        timestamp created_at
    }
    
    parent_consents {
        int id PK
        int user_id FK
        string parent_full_name
        string father_first_name
        string father_last_name
        string mother_first_name
        string mother_last_name
        date parent_birth_date
        string parent_id_number UK
        string parent_phone
        string parent_email
        string parent_location
        string parent_street
        string parent_street_number
        string parent_postal_code
        boolean consent_accepted
        text signature
        text consent_text
        string consent_version
        timestamp server_timestamp
        timestamp created_at
    }
    
    age_verification_logs {
        int id PK
        date birth_date
        int calculated_age
        boolean is_minor
        date server_date
        string ip_address
        text user_agent
        timestamp created_at
    }
```

## Βασικά Χαρακτηριστικά:

1. **users.is_minor**: Boolean flag για ανήλικους
2. **parent_consents**: Αποθήκευση στοιχείων γονέα με υπογραφή
3. **age_verification_logs**: Audit trail για όλους τους ελέγχους ηλικίας
4. **server_timestamp**: Νομικά έγκυρη ημερομηνία από server

## Security & Compliance:

- Unique constraint στο parent_id_number
- Server timestamps για audit trail
- Encryption των υπογραφών (σε implementation level)
- Foreign key constraints για data integrity