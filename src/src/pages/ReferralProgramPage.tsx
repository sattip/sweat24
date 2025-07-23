
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
import { apiRequest } from "@/config/api";
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
          code: dashboardData.referral_code || "LOADING",
          link: dashboardData.referral_link || "Φόρτωση...",
          referrals: dashboardData.total_referrals || 0,
          nextRewardAt: dashboardData.next_tier?.referrals_required || 1,
          nextReward: dashboardData.next_tier?.reward_name || "Δωρεάν προσωπική προπόνηση",
          rewards: dashboardData.earned_rewards || [],
          friends: dashboardData.referred_friends || [],
          availableTiers: tiersData || []
        });
      } catch (error) {
        console.error('Error fetching referral data:', error);
        const errorMessage = handleApiError(error as Error, 'Σφάλμα κατά τη φόρτωση των δεδομένων παραπομπών');
        toast.error(errorMessage);
        
        // ❌ ΑΦΑΙΡΕΣΗ MOCK DATA - Θα δείχνουμε κενή κατάσταση αντί για fake δεδομένα
        setReferralData({
          code: "",
          link: "",
          referrals: 0,
          nextRewardAt: 0,
          nextReward: "",
          rewards: [],
          friends: [],
          availableTiers: [] // ❌ ΚΕΝΑ TIERS - δεν θα εμφανίζονται mock rewards
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
                            Μοιράσου το Sweat93 με φίλους και κέρδισε αποκλειστικά δώρα!
          </p>
        </div>
        
        {/* Program Explanation Card */}
        <Card className="mb-6 border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Πώς Λειτουργεί</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-semibold">Προσκάλεσε φίλους να γίνουν μέλη του Sweat93 και κέρδισε πόντους για αποκλειστικά δώρα:</span>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><span className="font-medium">Κάθε πόντος</span> = 1 ευρώ αξία</li>
              <li><span className="font-medium">Περισσότερες παραπομπές</span> = Περισσότεροι πόντοι και καλύτερα δώρα</li>
              <li><span className="font-medium">Τα διαθέσιμα δώρα</span> ενημερώνονται τακτικά με νέες επιλογές</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Referral Code & Sharing */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Ο Σύνδεσμος Παραπομπής σου</CardTitle>
            <CardDescription>Μοιράσου αυτόν τον μοναδικό κωδικό με φίλους</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="border rounded-md p-3 bg-muted/50 font-mono text-sm overflow-hidden overflow-ellipsis">
                  {referralData.link}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => copyToClipboard(referralData.link)}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Αντιγραφή συνδέσμου</span>
                </Button>
              </div>
              <div>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto" 
                  onClick={() => copyToClipboard(referralData.code)}
                >
                  Αντιγραφή Κωδικού: {referralData.code}
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <p className="text-sm font-medium mb-3">Κοινοποίηση μέσω:</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span>Facebook</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span>Twitter</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <span>Instagram</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Περισσότερα</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Η Πρόοδος των Παραπομπών σου</CardTitle>
            <CardDescription>
              {referralData.nextRewardAt - referralData.referrals === 1 
                ? "Μόνο 1 ακόμη παραπομπή για να κερδίσεις το επόμενο δώρο!" 
                : `${referralData.nextRewardAt - referralData.referrals} ακόμη παραπομπές για το επόμενο δώρο!`}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rewards Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Τα Δώρα σου</CardTitle>
              <CardDescription>Δώρα που έχεις κερδίσει μέσω παραπομπών</CardDescription>
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
                      <div>
                        {reward.status === "available" ? (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleRedeemReward(reward.id)}
                          >
                            Εξαργύρωση
                          </Button>
                        ) : (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">
                            {reward.status === "redeemed" ? "Εξαργυρώθηκε" : "Έληξε"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Δεν έχεις κερδίσει ακόμη δώρα. Ξεκίνα να προσκαλείς φίλους!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Referred Friends Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Φίλοι που Παρέπεμψες</CardTitle>
              <CardDescription>Φίλοι που έγιναν μέλη χρησιμοποιώντας την παραπομπή σου</CardDescription>
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

        {/* Available Reward Tiers */}
        {referralData.availableTiers && referralData.availableTiers.length > 0 && (
          <Card className="mt-6 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Επίπεδα Ανταμοιβών</CardTitle>
              <CardDescription>Δείτε τι μπορείτε να κερδίσετε με κάθε παραπομπή</CardDescription>
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
