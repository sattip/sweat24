# SWEAT24 Client App - Technical Diagrams

Αυτός ο φάκελος περιέχει τα τεχνικά διαγράμματα για τις βασικές λειτουργίες της εφαρμογής SWEAT24 Client App.

## 📋 Περιεχόμενα

### 1. Minor Registration System
- **[minor-registration-flow.md](./minor-registration-flow.md)**: Sequence diagram για τη ροή εγγραφής ανηλίκων
- **[minor-registration-database.md](./minor-registration-database.md)**: ER diagram για τη database structure των ανηλίκων

### 2. How Found Us System  
- **[how-found-us-flow.md](./how-found-us-flow.md)**: Flowchart για τη ροή της φόρμας "Πώς μας βρήκατε"
- **[how-found-us-database.md](./how-found-us-database.md)**: ER diagram για τη database structure των referrals
- **[how-found-us-ui.md](./how-found-us-ui.md)**: UI component structure diagram

## 🔧 Πώς να δείτε τα διαγράμματα

Τα διαγράμματα είναι γραμμένα σε **Mermaid** format και μπορείτε να τα δείτε:

1. **GitHub**: Απευθείας στο GitHub (native Mermaid support)
2. **VS Code**: Με το Mermaid Preview extension
3. **Online**: Στο [mermaid.live](https://mermaid.live)
4. **Documentation Tools**: Σε οποιοδήποτε tool που υποστηρίζει Mermaid

## 📚 Σχετικά Technical Reports

- **MINOR_REGISTRATION_COMPLETE_Technical_Report.md**: Πλήρης τεχνική αναφορά για το minor registration system
- **HOW_FOUND_US_Technical_Report.md**: Πλήρης τεχνική αναφορά για το "how found us" system
- **EMS_Technical_Report.md**: Τεχνική αναφορά για το EMS functionality

## 🎯 Χρήση των Διαγραμμάτων

Αυτά τα διαγράμματα προορίζονται για:

- **Backend Developers**: Για την υλοποίηση των API endpoints και database schema
- **Admin Panel Developers**: Για την κατανόηση των data structures
- **Project Managers**: Για overview των λειτουργιών
- **QA Team**: Για τη δημιουργία test cases

## 📝 Codebase Context

Τα διαγράμματα αντιστοιχούν στις ακόλουθες υλοποιήσεις:

- `src/components/signup-steps/BasicInfoStep.tsx` - Age verification
- `src/components/signup-steps/HowFoundUsStep.tsx` - How found us form
- `src/components/signup-steps/ParentConsentStep.tsx` - Parent consent
- `src/services/ageVerificationService.ts` - Age verification API
- `src/services/referralService.ts` - Referral validation API

---

**Ημερομηνία Δημιουργίας**: 5 Αυγούστου 2025  
**Συντάκτης**: AI Assistant για SWEAT24 Development Team  
**Version**: 1.0.0