import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as API from "@/config/api";

const PartnersPage = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [redemptionData, setRedemptionData] = useState(null);
  const [usedOffers, setUsedOffers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await API.apiRequest('/partners');
        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία φόρτωσης συνεργατών",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [toast]);

  const handleShowCode = async (partner) => {
    try {
      if (!partner.offer_id) {
        toast({
          title: "Σφάλμα",
          description: "Δεν υπάρχει διαθέσιμη προσφορά",
          variant: "destructive",
        });
        return;
      }

      const response = await API.apiRequest(`/partners/offers/${partner.offer_id}/redeem`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPartner(partner);
        setRedemptionData(data);
        setIsVerificationOpen(true);
      } else {
        // Χαρτογράφηση γνωστών λαθών από backend (400)
        let errorJson: any = null;
        try { errorJson = await response.json(); } catch {}

        const msg = (errorJson?.message || '').toString().toLowerCase();

        // Αν υπάρχει ήδη redemption για σήμερα, δείξε τον υπάρχοντα κωδικό αντί για σφάλμα
        if (response.status === 400 && msg.includes('already') && msg.includes('used') && errorJson?.redemption) {
          setSelectedPartner(partner);
          setRedemptionData(errorJson);
          setIsVerificationOpen(true);
          toast({ title: "Ήδη χρησιμοποιήθηκε σήμερα", description: "Σας εμφανίζουμε τον υφιστάμενο κωδικό.", duration: 2500 });
          return;
        }

        // Όριο ανά χρήστη
        if (response.status === 400 && msg.includes('usage') && msg.includes('limit')) {
          toast({ title: "Όριο χρήσης", description: "Έχετε εξαντλήσει το όριο χρήσης αυτής της προσφοράς.", variant: "destructive" });
          return;
        }

        toast({
          title: "Σφάλμα",
          description: errorJson?.message || "Αποτυχία δημιουργίας κωδικού",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating redemption code:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας κωδικού",
        variant: "destructive",
      });
    }
  };

  const handleRedeemOffer = async () => {
    try {
      if (!redemptionData?.redemption?.id) return;

      const response = await API.apiRequest(`/partners/redemptions/${redemptionData.redemption.id}/use`, {
        method: 'POST'
      });

      if (response.ok) {
        const today = new Date().toDateString();
        const partnerId = selectedPartner?.id;
        
        if (partnerId) {
          setUsedOffers(prev => ({
            ...prev,
            [partnerId]: today
          }));
        }
        
        toast({
          title: "Προσφορά Εξαργυρώθηκε!",
          description: `Η προσφορά στο ${selectedPartner?.name} χρησιμοποιήθηκε για σήμερα.`,
          duration: 3000,
        });
        
        setIsVerificationOpen(false);
      } else {
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία εξαργύρωσης",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error using redemption:', error);
      toast({
        title: "Σφάλμα", 
        description: "Αποτυχία εξαργύρωσης",
        variant: "destructive",
      });
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
                            <p className="text-muted-foreground mt-1">Αποκλειστικές προσφορές για τα μέλη του Sweat93.</p>
          </div>
          
          {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
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
        )}
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
                <AvatarImage src={redemptionData?.user?.avatarUrl} alt={redemptionData?.user?.name} />
                <AvatarFallback>{redemptionData?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-center">
                <p className="font-bold text-xl">{redemptionData?.user?.name || 'Χρήστης'}</p>
                <p className="text-green-600 font-semibold">{redemptionData?.user?.membership_status || 'Ενεργός'}</p>
                <p className="text-sm text-muted-foreground">ID: {redemptionData?.user?.membership_id || 'SW24-XXXX'}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg w-full text-center">
                <p className="text-sm text-muted-foreground">Κωδικός Προσφοράς</p>
                <p className="text-2xl font-bold tracking-widest">{redemptionData?.redemption?.verification_code || 'S24-PROMO'}</p>
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