import React from "react";
import Header from "@/components/Header";
import { Dumbbell } from "lucide-react";

const ProgressPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Header */}
      <div className="bg-red-800 text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Προπονητικό Κομμάτι</h1>
              <p className="text-red-200 text-sm">
                Παρακολουθήστε την πρόοδό σας
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted/40 rounded-full p-6 mb-4">
            <Dumbbell className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Σύντομα διαθέσιμο</h3>
          <p className="text-muted-foreground max-w-md">
            Το προπονητικό κομμάτι θα είναι διαθέσιμο σύντομα.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
