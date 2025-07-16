
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

const ReferralProgramPage = () => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await apiRequest('/referral/data');
        if (response.ok) {
          const data = await response.json();
          setReferralData(data);
        } else {
          // If not authenticated, show default/empty state
          setReferralData({
            code: "LOGIN_REQUIRED",
            link: "Συνδεθείτε για να δείτε τον κωδικό σας",
            referrals: 0,
            nextRewardAt: 1,
            nextReward: "Δωρεάν προσωπική προπόνηση",
            rewards: [],
            friends: []
          });
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        setReferralData({
          code: "ERROR",
          link: "Σφάλμα φόρτωσης",
          referrals: 0,
          nextRewardAt: 1,
          nextReward: "Δωρεάν προσωπική προπόνηση",
          rewards: [],
          friends: []
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
            Μοιράσου το Sweat24 με φίλους και κέρδισε αποκλειστικά δώρα!
          </p>
        </div>
        
        {/* Program Explanation Card */}
        <Card className="mb-6 border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Πώς Λειτουργεί</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-semibold">Προσκάλεσε φίλους να γίνουν μέλη του Sweat24 και κέρδισε φανταστικά δώρα:</span>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><span className="font-medium">1 παραπομπή</span> = Δωρεάν προσωπική προπόνηση</li>
              <li><span className="font-medium">3 παραπομπές</span> = 50% έκπτωση τον επόμενο μήνα</li>
              <li><span className="font-medium">5 παραπομπές</span> = Ένας μήνας δωρεάν συνδρομή!</li>
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
