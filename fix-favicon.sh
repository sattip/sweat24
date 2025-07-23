#!/bin/bash

echo "🔧 ΔΙΟΡΘΩΣΗ FAVICON - Sweat24 Logo"
echo "=================================="

# Βήμα 1: Αντιγραφή του logo ως favicon
echo "📋 Αντιγραφή logo ως favicon..."
cp public/logo-dark.png public/favicon.ico

# Βήμα 2: Build της εφαρμογής
echo "🏗️ Building εφαρμογή..."
npm run build

# Βήμα 3: Έλεγχος αν το build ολοκληρώθηκε
if [ $? -eq 0 ]; then
    echo "✅ Build ολοκληρώθηκε επιτυχώς!"
    echo "🎯 Favicon διορθώθηκε - θα βλέπετε το logo του Sweat24"
    echo ""
    echo "📌 ΣΗΜΕΙΩΣΗ: Κάντε hard refresh (Ctrl+F5) στον browser"
    echo "   για να φορτωθεί το νέο favicon!"
else
    echo "❌ Build απέτυχε"
fi

echo ""
echo "✅ Script ολοκληρώθηκε!" 