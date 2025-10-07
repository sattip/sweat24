import React from 'react';

const MinimalNotificationSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          🔔 Ειδοποιήσεις
        </h1>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Έρχονται Σύντομα!</h2>
          <p className="text-gray-600 mb-4">
            Οι ειδοποιήσεις είναι υπό ανάπτυξη και θα είναι διαθέσιμες στην επόμενη έκδοση της εφαρμογής.
          </p>
          <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            Η λειτουργία βρίσκεται σε beta δοκιμές
          </span>
        </div>
      </div>

      {/* Features Preview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Τι θα περιλαμβάνει;</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-green-500 text-xl">📅</span>
            <div>
              <h4 className="font-medium text-gray-800">Υπενθύμιση Ραντεβού</h4>
              <p className="text-gray-600 text-sm">1 ώρα πριν το μάθημά σας</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-orange-500 text-xl">⏰</span>
            <div>
              <h4 className="font-medium text-gray-800">Λήξη Πακέτου</h4>
              <p className="text-gray-600 text-sm">1 εβδομάδα και 2 μέρες πριν τη λήξη</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-blue-500 text-xl">✅</span>
            <div>
              <h4 className="font-medium text-gray-800">Ειδικές Προσφορές</h4>
              <p className="text-gray-600 text-sm">Ενημερώσεις για νέα πακέτα</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mb-3">
            Κατάσταση: Υπό Ανάπτυξη
          </span>
          <br />
          <button 
            disabled
            className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
          >
            Ενεργοποίηση (Σύντομα)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalNotificationSettings;
