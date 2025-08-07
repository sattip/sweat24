# How Found Us Database Schema

Αυτό το διάγραμμα δείχνει τη δομή της βάσης δεδομένων για τη λειτουργία "Πώς μας βρήκατε".

```mermaid
erDiagram
    users ||--o{ users : refers
    users ||--o{ user_referral_codes : has
    users ||--o{ referral_validation_logs : generates
    
    users {
        int id PK
        string firstName
        string lastName
        string email
        string phone
        enum found_us_via
        int referrer_id FK
        enum social_platform
        string referral_code_or_name
        timestamp created_at
    }
    
    user_referral_codes {
        int id PK
        int user_id FK
        string referral_code UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    referral_validation_logs {
        int id PK
        string code_or_name
        boolean is_valid
        int referrer_id FK
        string ip_address
        text user_agent
        timestamp created_at
    }
```

## Enum Values:

### found_us_via:
- `referral`: Σύσταση
- `social`: Social Media
- `google`: Google
- `site`: Website  
- `passing_by`: Πέρναγα απέξω
- `know_owner`: Γνωρίζω τον ιδιοκτήτη

### social_platform:
- `instagram`: Instagram
- `tiktok`: TikTok
- `facebook`: Facebook

## Key Features:

1. **Self-referencing**: users.referrer_id → users.id
2. **Custom Referral Codes**: Προαιρετικοί custom κωδικοί
3. **Validation Logs**: Audit trail για security
4. **Flexible Structure**: Υποστηρίζει όλες τις πηγές εγγραφής

## Indexes για Performance:

- `idx_users_found_us_via`
- `idx_users_referrer_id`
- `idx_users_social_platform`
- `idx_referral_code`