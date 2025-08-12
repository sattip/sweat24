import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Copy, Facebook, Instagram, Mail, Share2, Twitter, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import * as API from "@/config/api";
import { referralsService } from "@/services/apiService";

// Error handling helper function
const handleApiError = (error: Error, fallbackMessage = 'Κάτι πήγε στραβά'): string => {
  if (error.message.includes('401')) {
    return 'Παρακαλώ συνδεθείτε ξανά';
  }
  if (error.message.includes('404')) {
    return 'Δεν βρέθηκαν δεδομένα';
  }
  if (error.message.includes('500')) {
    return 'Πρόβλημα διακομιστή, προσπαθήστε αργότερα';
  }
  return fallbackMessage;
};

const ReferralProgramPage = () => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        // ✅ ΣΩΣΤΟ: Χρησιμοποιούμε το σωστό API endpoint από το sweat93laravel.obs.com.gr
        // Το referralsService.getDashboard() καλεί το: https://sweat93laravel.obs.com.gr/api/v1/referrals/dashboard
        // Το referralsService.getAvailableTiers() καλεί το: https://sweat93laravel.obs.com.gr/api/v1/referrals/available-tiers
        const [dashboardData, tiersData] = await Promise.all([
          referralsService.getDashboard(),
          referralsService.getAvailableTiers()
        ]);
        
        // Map backend data to component format
        setReferralData({
          code: dashboardData.referral_code || "",
          link: dashboardData.referral_link || "",
          referrals: dashboardData.total_referrals || 0,
          nextRewardAt: dashboardData.next_tier?.referrals_required || 0,
          nextReward: dashboardData.next_tier?.reward_name || "",
          rewards: dashboardData.earned_rewards || [],
          friends: dashboardData.referred_friends || [],
          availableTiers: tiersData || []
        });
      } catch (error) {
        console.error('Error fetching referral data:', error);
        const errorMessage = handleApiError(error as Error, 'Σφάλμα κατά τη φόρτωση των δεδομένων συστάσεων');
        toast.error(errorMessage);
        
        // ❌ ΚΕΝΑ DATA - Θα δείχνουμε κενή κατάσταση όταν το API δεν λειτουργεί
        // ΔΕΝ εμφανίζουμε πια mock data - μόνο τα πραγματικά δώρα από το admin panel
        setReferralData({
          code: "",
          link: "",
          referrals: 0,
          nextRewardAt: 0,
          nextReward: "",
          rewards: [],
          friends: [],
          availableTiers: [] // ❌ ΚΕΝΑ TIERS - δεν θα εμφανίζονται fake rewards
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  const handleRedeemReward = async (rewardId) => {
    try {
      const response = await apiRequest(`/referral/redeem/${rewardId}`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success("Το δώρο εξαργυρώθηκε επιτυχώς!");
        // Refresh data
        window.location.reload();
      } else {
        toast.error("Σφάλμα κατά την εξαργύρωση");
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error("Σφάλμα κατά την εξαργύρωση");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Αντιγράφηκε στο πρόχειρο!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Σφάλμα φόρτωσης</h1>
            <p className="text-muted-foreground mt-2">Παρακαλώ δοκιμάστε ξανά.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Προσκάλεσε Φίλους & Κέρδισε Δώρα</h1>
          <p className="text-muted-foreground mt-2">
            Δείτε τι μπορείτε να κερδίσετε με κάθε σύσταση
          </p>
        </div>
        
        {/* Program Explanation Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Πώς Λειτουργεί το Πρόγραμμα Συστάσεων</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full flex items-center justify-center h-16 w-16 mx-auto mb-3">
                  <Share2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Μοιράσου</h3>
                <p className="text-sm text-muted-foreground">
                  Στείλε τον κωδικό ή το link σύστασης σου σε φίλους
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full flex items-center justify-center h-16 w-16 mx-auto mb-3">
                  <Copy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Εγγραφή</h3>
                <p className="text-sm text-muted-foreground">
                  Οι φίλοι σου γίνονται μέλη χρησιμοποιώντας τον κωδικό σου
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full flex items-center justify-center h-16 w-16 mx-auto mb-3">
                  <div className="text-primary font-bold text-lg">🎁</div>
                </div>
                <h3 className="font-semibold mb-2">3. Κέρδισε</h3>
                <p className="text-sm text-muted-foreground">
                  Λαμβάνεις δώρα για κάθε επιτυχημένη σύσταση
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code and Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ο Κωδικός σου</CardTitle>
              <CardDescription>Μοιράσου αυτόν τον κωδικό με φίλους</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.code ? (
                <div className="flex items-center gap-2">
                  <div className="bg-muted px-4 py-2 rounded-lg font-mono text-lg font-bold flex-1 text-center">
                    {referralData.code}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(referralData.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Δεν υπάρχει διαθέσιμος κωδικός σύστασης
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Link Σύστασης</CardTitle>
              <CardDescription>Ή στείλε απευθείας αυτό το link</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.link ? (
                <div className="flex items-center gap-2">
                  <div className="bg-muted px-3 py-2 rounded-lg text-sm flex-1 truncate">
                    {referralData.link}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(referralData.link)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Δεν υπάρχει διαθέσιμο link σύστασης
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex gap-2 w-full">
                {referralData.link && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                      const text = `Ελα στο Sweat93! Χρησιμοποίησε τον κωδικό μου ${referralData.code} ή το link: ${referralData.link}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.link)}&quote=${encodeURIComponent(text)}`, '_blank');
                    }}>
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                      const text = `Ελα στο Sweat93! 💪 Κωδικός: ${referralData.code} Link: ${referralData.link}`;
                      window.open(`https://www.instagram.com/?url=${encodeURIComponent(referralData.link)}`, '_blank');
                    }}>
                      <Instagram className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                      const text = `Ελα στο Sweat93! Χρησιμοποίησε τον κωδικό μου ${referralData.code} ή το link: ${referralData.link}`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                    }}>
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                      const subject = "Έλα στο Sweat93!";
                      const body = `Γεια σου!\n\nΘα ήθελα να σε προσκαλέσω στο Sweat93. Χρησιμοποίησε τον κωδικό μου ${referralData.code} κατά την εγγραφή σου.\n\nΕναλλακτικά, μπορείς να κάνεις κλικ εδώ: ${referralData.link}\n\nΤα λέμε στο γυμναστήριο! 💪`;
                      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
                    }}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Progress Card */}
        {referralData.nextRewardAt > 0 && (
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Η Πρόοδος των Συστάσεων σου</CardTitle>
              <CardDescription>
                {referralData.nextRewardAt - referralData.referrals === 1 
                                    ? "Μόνο 1 ακόμη σύσταση για να κερδίσεις το επόμενο δώρο!"
                  : `${referralData.nextRewardAt - referralData.referrals} ακόμη συστάσεις για το επόμενο δώρο!`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full flex items-center justify-center h-14 w-14 text-primary font-bold text-xl">
                  {referralData.referrals}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Πρόοδος για {referralData.nextReward}
                  </p>
                  <div className="space-y-2 w-full">
                    <Progress 
                      value={(referralData.referrals / referralData.nextRewardAt) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs">
                      <span>0</span>
                      <span>{referralData.nextRewardAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rewards Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Τα Δώρα σου</CardTitle>
              <CardDescription>Δώρα που έχεις κερδίσει μέσω συστάσεων</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.rewards.length > 0 ? (
                <div className="space-y-4">
                  {referralData.rewards.map((reward, index) => (
                    <div key={index} className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
                      <div>
                        <p className="font-medium text-sm">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {reward.status === "available" 
                            ? `Λήγει: ${reward.expires_at ? new Date(reward.expires_at).toLocaleDateString() : 'Χωρίς λήξη'}`
                            : `Εξαργυρώθηκε στις: ${reward.redeemed_at ? new Date(reward.redeemed_at).toLocaleDateString() : 'Άγνωστη ημερομηνία'}`}
                        </p>
                      </div>
                      {reward.status === "available" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRedeemReward(reward.id)}
                        >
                          Εξαργύρωση
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Δεν έχεις κερδίσει δώρα ακόμη.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Προσκάλεσε φίλους για να κερδίσεις το πρώτο σου δώρο!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friends Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Φίλοι που Παρέπεμψες</CardTitle>
              <CardDescription>Φίλοι που έγιναν μέλη χρησιμοποιώντας τη σύσταση σου</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.friends.length > 0 ? (
                <div className="space-y-3">
                  {referralData.friends.map((friend, index) => (
                    <div key={index} className="flex items-center gap-3 bg-muted/30 p-3 rounded-md">
                      <Avatar>
                        <AvatarFallback>
                          {friend.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{friend.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Έγινε μέλος: {new Date(friend.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Κανένας από τους φίλους σου δεν έχει γίνει ακόμη μέλος.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Reward Tiers - ΜΟΝΟ αν υπάρχουν πραγματικά δώρα από το admin panel */}
        {referralData.availableTiers && referralData.availableTiers.length > 0 && (
          <Card className="mt-6 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Επίπεδα Ανταμοιβών</CardTitle>
              <CardDescription>Δείτε τι μπορείτε να κερδίσετε με κάθε σύσταση</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referralData.availableTiers.map((tier, index) => (
                  <Card key={tier.id || index} className="border-2 hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {tier.referrals_required} συστάσεις
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{tier.reward_name}</div>
                        <p className="text-sm text-muted-foreground mt-1">{tier.reward_description}</p>
                      </div>
                      
                      {tier.expires_at && (
                        <p className="text-xs text-muted-foreground text-center">
                          Ισχύει έως: {new Date(tier.expires_at).toLocaleDateString('el-GR')}
                        </p>
                      )}
                      
                      <div className="text-center">
                        {referralData.referrals >= tier.referrals_required ? (
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ✓ Επιτεύχθηκε
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Χρειάζεστε {tier.referrals_required - referralData.referrals} ακόμη
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Αν δεν υπάρχουν δώρα, δείχνουμε ενημερωτικό μήνυμα */}
        {(!referralData.availableTiers || referralData.availableTiers.length === 0) && (
          <Card className="mt-6 shadow-sm">
            <CardContent className="py-8 text-center">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-lg font-semibold mb-2">Σύντομα διαθέσιμα δώρα!</h3>
                <p className="text-sm">
                  Η γραμματεία ετοιμάζει ειδικά δώρα για το πρόγραμμα συστάσεων.
                </p>
                <p className="text-sm mt-1">
                  Συνεχίστε να προσκαλείτε φίλους - θα κερδίσετε αναδρομικά!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Terms & Conditions */}
        <div className="mt-6 text-center">
          <Link to="/terms-referral" className="text-sm text-primary underline">
            Προβολή Όρων & Προϋποθέσεων
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ReferralProgramPage; 