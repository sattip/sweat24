# How Found Us Registration Flow

Αυτό το διάγραμμα δείχνει τη ροή της φόρμας "Πώς μας βρήκατε;" στη διαδικασία εγγραφής.

```mermaid
flowchart TD
    A[Βασικά Στοιχεία] --> B[Πώς μας βρήκατε;]
    B --> C{Επέλεξε 'Σύσταση'?}
    C -->|Ναι| D[Εισαγωγή κωδικού/ονόματος]
    D --> E[API Validation]
    E --> F{Έγκυρος?}
    F -->|Ναι| G[✅ Validation Success]
    F -->|Όχι| H[❌ Invalid Referral]
    H --> D
    C -->|Όχι| I{Επέλεξε 'Social'?}
    I -->|Ναι| J[Επιλογή Platform]
    I -->|Όχι| K[Συνέχεια]
    J --> K
    G --> K
    K --> L{Είναι ανήλικος?}
    L -->|Ναι| M[Συγκατάθεση Γονέα]
    L -->|Όχι| N[Ιατρικό Ιστορικό]
    M --> N
    N --> O[Επισκόπηση]
    O --> P[Ολοκλήρωση Εγγραφής]
    
    style B fill:#e1f5fe
    style D fill:#fff3e0
    style E fill:#f3e5f5
    style G fill:#e8f5e8
    style H fill:#ffebee
```

## Επιλογές "Πώς μας βρήκατε":

1. **Σύσταση**: Απαιτεί validation με API call
2. **Social**: Απαιτεί επιλογή platform (Instagram/TikTok/Facebook)
3. **Google**: Άμεση συνέχεια
4. **Site**: Άμεση συνέχεια  
5. **Πέρναγα απέξω**: Άμεση συνέχεια
6. **Γνωρίζω τον ιδιοκτήτη**: Άμεση συνέχεια

## Validation Features:

- Real-time referral validation
- Security-first approach (no user enumeration)
- Rate limiting protection
- Error handling με user-friendly messages