# How Found Us UI Components

Αυτό το διάγραμμα δείχνει τη δομή του UI για τη φόρμα "Πώς μας βρήκατε".

```mermaid
graph TB
    subgraph "Πώς μας βρήκατε; Form"
        A[Radio Group: Επιλογή πηγής]
        A --> B[Σύσταση]
        A --> C[Social]
        A --> D[Google]
        A --> E[Site]
        A --> F[Πέρναγα απέξω]
        A --> G[Γνωρίζω ιδιοκτήτη]
    end
    
    subgraph "Conditional: Σύσταση"
        B --> H[Input: Κωδικός/Όνομα]
        H --> I[Real-time Validation]
        I --> J{API Response}
        J -->|Valid| K[✅ Success Message]
        J -->|Invalid| L[❌ Error Message]
    end
    
    subgraph "Conditional: Social"
        C --> M[Radio Group: Platform]
        M --> N[Instagram]
        M --> O[TikTok]
        M --> P[Facebook]
    end
    
    style A fill:#e3f2fd
    style H fill:#fff8e1
    style I fill:#f3e5f5
    style K fill:#e8f5e8
    style L fill:#ffebee
    style M fill:#e8eaf6
```

## UI Components:

1. **Main Radio Group**: Επιλογή πηγής εγγραφής
2. **Conditional Input**: Εμφανίζεται για "Σύσταση"
3. **Real-time Validation**: Live feedback για referral codes
4. **Social Platform Selection**: Υποκατηγορίες για social media
5. **Visual Feedback**: Success/error states με χρώματα

## UX Features:

- **Progressive Disclosure**: Conditional fields εμφανίζονται όταν χρειάζονται
- **Real-time Validation**: Άμεση ανατροφοδότηση χωρίς form submission
- **Visual Indicators**: Loading, success, και error states
- **Accessibility**: Proper labeling και keyboard navigation

## State Management:

- Form validation per step
- Conditional field reset όταν αλλάζει η επιλογή
- API call debouncing για performance
- Error handling με user-friendly messages