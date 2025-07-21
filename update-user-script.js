// Script για την ενημέρωση του status του χρήστη user@sweat24.gr
// Εκτελέστε αυτό το script στην κονσόλα του browser (F12 -> Console)

function updateUserSweat24Status() {
  try {
    // Ελέγχουμε αν υπάρχει localStorage
    if (typeof localStorage === 'undefined') {
      console.error('LocalStorage δεν είναι διαθέσιμο');
      return;
    }

    // Παίρνουμε τον τρέχοντα χρήστη από localStorage
    const currentUserStr = localStorage.getItem('sweat24_user');
    
    if (!currentUserStr) {
      console.error('Δεν βρέθηκε συνδεδεμένος χρήστης');
      console.log('Παρακαλώ συνδεθείτε πρώτα με το email: user@sweat24.gr');
      return;
    }

    const currentUser = JSON.parse(currentUserStr);
    
    // Ελέγχουμε αν είναι ο σωστός χρήστης
    if (currentUser.email !== 'user@sweat24.gr') {
      console.error('Ο συνδεδεμένος χρήστης δεν είναι ο user@sweat24.gr');
      console.log('Τρέχων χρήστης:', currentUser.email);
      console.log('Παρακαλώ συνδεθείτε με το email: user@sweat24.gr');
      return;
    }

    // Ενημερώνουμε τα στοιχεία του χρήστη
    const today = new Date();
    const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const updatedUser = {
      ...currentUser,
      status: 'active',
      remaining_sessions: 10,
      total_sessions: 10,
      package_start_date: today.toISOString().split('T')[0],
      package_end_date: oneMonthLater.toISOString().split('T')[0],
      membership_type: 'Premium',
      last_visit: today.toISOString().split('T')[0],
    };
    
    // Αποθηκεύουμε τον ενημερωμένο χρήστη
    localStorage.setItem('sweat24_user', JSON.stringify(updatedUser));
    
    console.log('✅ Επιτυχής ενημέρωση!');
    console.log('📊 Νέα στοιχεία χρήστη:');
    console.log('- Status: Ενεργή συνδρομή');
    console.log('- Υπόλοιπο συνεδριών: 10/10');
    console.log('- Τύπος συνδρομής: Premium');
    console.log('- Ημερομηνία έναρξης:', today.toLocaleDateString('el-GR'));
    console.log('- Ημερομηνία λήξης:', oneMonthLater.toLocaleDateString('el-GR'));
    
    // Ανανεώνουμε τη σελίδα για να φανούν οι αλλαγές
    console.log('🔄 Ανανέωση σελίδας σε 2 δευτερόλεπτα...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Σφάλμα κατά την ενημέρωση:', error);
  }
}

// Εκτέλεση του script
console.log('🚀 Εκκίνηση ενημέρωσης του χρήστη user@sweat24.gr...');
updateUserSweat24Status(); 