import React, { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for partner businesses
const mockPartners = [
  {
    id: "partner_1",
    name: "The Coffee Spot",
    logoUrl: "/placeholder.svg",
    offer: "15% έκπτωση σε όλους τους καφέδες",
    description: "Το ιδανικό μέρος για να χαλαρώσετε μετά την προπόνηση με τον καλύτερο καφέ της πόλης.",
  },
  {
    id: "partner_2",
    name: "Healthy Bites",
    logoUrl: "/placeholder.svg",
    offer: "10% έκπτωση σε όλα τα γεύματα",
    description: "Θρεπτικά και νόστιμα γεύματα για να υποστηρίξετε τους στόχους της φυσικής σας κατάστασης.",
  },
  {
    id: "partner_3",
    name: "Sports Gear Pro",
    logoUrl: "/placeholder.svg",
    offer: "20% έκπτωση σε είδη ρουχισμού",
    description: "Βρείτε τον καλύτερο εξοπλισμό και ρουχισμό για τις προπονήσεις σας.",
  },
];

// Mock user data for verification
const mockUserData = {
    name: "Γιάννης Παπαδόπουλος",
    avatarUrl: "/placeholder.svg",
    membershipStatus: "Ενεργός",
    membershipId: "SW24-2025-001"
};

const PartnersPage = () => {
  const { toast } = useToast();
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [usedOffers, setUsedOffers] = useState<{ [key: string]: string }>({});

  const handleShowCode = (partner) => {
    setSelectedPartner(partner);
    setIsVerificationOpen(true);
  };

  const handleRedeemOffer = () => {
    const today = new Date().toDateString();
    const partnerId = selectedPartner?.id;
    
    if (partnerId) {
      setUsedOffers(prev => ({
        ...prev,
        [partnerId]: today
      }));
      
      toast({
        title: "Προσφορά Εξαργυρώθηκε!",
        description: `Η προσφορά στο ${selectedPartner?.name} χρησιμοποιήθηκε για σήμερα.`,
        duration: 3000,
      });
      
      setIsVerificationOpen(false);
    }
  };

  const isOfferUsedToday = (partnerId: string) => {
    const today = new Date().toDateString();
    return usedOffers[partnerId] === today;
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Συνεργαζόμενες Επιχειρήσεις</h1>
            <p className="text-muted-foreground mt-1">Αποκλειστικές προσφορές για τα μέλη του Sweat24.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPartners.map((partner) => (
              <Card key={partner.id} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={partner.logoUrl} alt={partner.name} />
                    <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{partner.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-lg font-semibold text-primary">{partner.offer}</p>
                  <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
                  {isOfferUsedToday(partner.id) && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Χρησιμοποιήθηκε σήμερα</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleShowCode(partner)}
                    disabled={isOfferUsedToday(partner.id)}
                  >
                    {isOfferUsedToday(partner.id) ? "Χρησιμοποιήθηκε" : "Εμφάνιση Προσφοράς"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {/* Verification Modal */}
      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{selectedPartner?.name}</DialogTitle>
            <DialogDescription className="text-center">
              Δείξτε αυτή την οθόνη στον συνεργάτη για επαλήθευση.
            </DialogDescription>
          </DialogHeader>
          
          {/* Green verification indicator */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-green-800 font-bold text-lg">ΕΠΑΛΗΘΕΥΜΕΝΟΣ ΠΕΛΑΤΗΣ</span>
            </div>
            <p className="text-center text-green-700 text-sm">Η συνδρομή είναι ενεργή</p>
          </div>
          
          <div className="py-4 flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={mockUserData.avatarUrl} alt={mockUserData.name} />
                <AvatarFallback>{mockUserData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="text-center">
                <p className="font-bold text-xl">{mockUserData.name}</p>
                <p className="text-green-600 font-semibold">{mockUserData.membershipStatus}</p>
                <p className="text-sm text-muted-foreground">ID: {mockUserData.membershipId}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg w-full text-center">
                <p className="text-sm text-muted-foreground">Κωδικός Προσφοράς</p>
                <p className="text-2xl font-bold tracking-widest">S24-PROMO</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsVerificationOpen(false)} 
              className="flex-1"
            >
              Ακύρωση
            </Button>
            <Button 
              onClick={handleRedeemOffer} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Εξαργύρωση
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartnersPage; 