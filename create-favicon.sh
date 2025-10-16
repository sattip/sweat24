#!/bin/bash

# Script για δημιουργία favicon από το logo του γυμναστηρίου
echo "🎯 Δημιουργία favicon από το logo του sweat93..."

# Έλεγχος αν υπάρχει το ImageMagick (convert command)
if command -v convert >/dev/null 2>&1; then
    echo "✅ ImageMagick βρέθηκε - Δημιουργία favicon..."
    
    # Δημιουργία favicon.ico από το logo-dark.png
    convert public/logo-dark.png -resize 32x32 -format ico public/favicon.ico
    
    echo "✅ Favicon δημιουργήθηκε επιτυχώς!"
    
    # Δημιουργία και άλλων μεγεθών icons
    convert public/logo-dark.png -resize 16x16 public/favicon-16x16.png
    convert public/logo-dark.png -resize 32x32 public/favicon-32x32.png
    convert public/logo-dark.png -resize 180x180 public/apple-touch-icon.png
    
    echo "✅ Όλα τα icon formats δημιουργήθηκαν!"
    
else
    echo "❌ ImageMagick δεν είναι εγκατεστημένο"
    echo "💡 Εναλλακτικά, μπορείτε να χρησιμοποιήσετε online tools:"
    echo "   - https://favicon.io/favicon-converter/"
    echo "   - https://realfavicongenerator.net/"
    echo "   Ανεβάστε το public/logo-dark.png και κατεβάστε το favicon.ico"
fi

echo "🎯 Τέλος script" 