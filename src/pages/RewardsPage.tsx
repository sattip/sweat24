import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Crown, Trophy, Calendar, Loader2 } from "lucide-react";
import { loyaltyService } from "@/services/apiService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface LoyaltyDashboard {
  current_points: number;
  total_earned_points: number;
  redeemed_rewards_count: number;
  next_tier?: {
    name: string;
    points_required: number;
    points_needed: number;
  };
  current_tier?: {
    name: string;
    benefits: string[];
  };
}

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  category?: string;
  expires_at?: string;
  is_affordable: boolean;
  is_limited_time: boolean;
}

const RewardsPage = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<LoyaltyDashboard | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingIds, setRedeemingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [dashboardData, rewardsData] = await Promise.all([
        loyaltyService.getDashboard(),
        loyaltyService.getAvailableRewards()
      ]);
      
      setDashboard(dashboardData);
      setRewards(rewardsData);
    } catch (error) {
      console.error('❌ Error fetching loyalty data:', error);
      
      setDashboard({
        current_points: 0,
        total_earned_points: 0,
        redeemed_rewards_count: 0,
        next_tier: null,
        current_tier: null
      });
      
      setRewards([]);
      
      const errorMessage = error.message || 'Σφάλμα κατά τη φόρτωση των δεδομένων ανταμοιβής';
      toast.error(`${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    try {
      setRedeemingIds(prev => new Set([...prev, rewardId]));
      await loyaltyService.redeemReward(rewardId);
      toast.success('Το δώρο εξαργυρώθηκε επιτυχώς!');
      
      // Refresh data
      await fetchLoyaltyData();
    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      toast.error(error.message || 'Σφάλμα κατά την εξαργύρωση του δώρου');
    } finally {
      setRedeemingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(rewardId);
        return newSet;
      });
    }
  };

  const getCategoryIcon = (category?: string) => {
    const categoryLower = category?.toLowerCase() || '';
    switch (categoryLower) {
      case 'training':
        return <Trophy className="h-5 w-5" />;
      case 'product':
        return <Gift className="h-5 w-5" />;
      case 'premium':
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Έληξε';
    if (diffDays === 1) return 'Λήγει σήμερα';
    if (diffDays <= 7) return `Λήγει σε ${diffDays} μέρες`;
    
    return `Λήγει στις ${date.toLocaleDateString('el-GR')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Πρόγραμμα Ανταμοιβής</h1>
          <p className="text-muted-foreground mt-2">
            Κερδίστε πόντους με κάθε προπόνηση και εξαργυρώστε υπέροχα δώρα
          </p>
        </div>

        {dashboard && (
          <>
            {/* Points Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Διαθέσιμοι Πόντοι</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{dashboard.current_points}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Συνολικά κερδισμένοι: {dashboard.total_earned_points}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Επίπεδο</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold">{dashboard.current_tier?.name || 'Νέο Μέλος'}</div>
                  {dashboard.current_tier?.benefits && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Προνόμια:</p>
                      <ul className="text-xs mt-1 space-y-1">
                        {dashboard.current_tier.benefits.slice(0, 2).map((benefit, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-primary" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Εξαργυρωμένα Δώρα</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{dashboard.redeemed_rewards_count}</div>
                  <p className="text-sm text-muted-foreground mt-1">Συνολικά δώρα</p>
                </CardContent>
              </Card>
            </div>

            {/* Next Tier Progress */}
            {dashboard.next_tier && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Πρόοδος για το επόμενο επίπεδο</CardTitle>
                  <CardDescription>
                    Χρειάζεστε {dashboard.next_tier.points_needed} ακόμη πόντους για το επίπεδο "{dashboard.next_tier.name}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress 
                      value={((dashboard.next_tier.points_required - dashboard.next_tier.points_needed) / dashboard.next_tier.points_required) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{dashboard.current_points} πόντοι</span>
                      <span>{dashboard.next_tier.points_required} πόντοι</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Available Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Διαθέσιμα Δώρα</CardTitle>
            <CardDescription>Εξαργυρώστε τους πόντους σας για υπέροχα δώρα</CardDescription>
          </CardHeader>
          <CardContent>
            {rewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => {
                  const isRedeeming = redeemingIds.has(reward.id);
                  const expirationInfo = formatExpirationDate(reward.expires_at);
                  
                  return (
                    <Card 
                      key={reward.id} 
                      className={`transition-all duration-200 ${
                        reward.is_affordable 
                          ? 'hover:border-primary cursor-pointer hover:shadow-md' 
                          : 'opacity-60'
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(reward.category)}
                            <CardTitle className="text-lg">{reward.name}</CardTitle>
                          </div>
                          {reward.is_limited_time && (
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Περιορισμένος χρόνος
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-primary">
                            {reward.points_required} πόντοι
                          </div>
                          <Badge variant={reward.is_affordable ? "default" : "secondary"}>
                            {reward.category || 'Γενικό'}
                          </Badge>
                        </div>

                        {expirationInfo && (
                          <p className={`text-xs ${
                            expirationInfo.includes('σήμερα') || expirationInfo.includes('Έληξε')
                              ? 'text-red-600 font-medium'
                              : 'text-muted-foreground'
                          }`}>
                            {expirationInfo}
                          </p>
                        )}

                        <Button
                          onClick={() => handleRedeemReward(reward.id)}
                          disabled={!reward.is_affordable || isRedeeming}
                          className="w-full"
                          variant={reward.is_affordable ? "default" : "secondary"}
                        >
                          {isRedeeming ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Εξαργύρωση...
                            </>
                          ) : (
                            <>
                              <Gift className="h-4 w-4 mr-2" />
                              {reward.is_affordable ? 'Εξαργύρωση' : 'Δεν επαρκούν οι πόντοι'}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Δεν βρέθηκαν διαθέσιμα δώρα ανταμοιβής</h3>
                <p className="text-muted-foreground">
                  Δεν υπάρχουν προς το παρόν διαθέσιμα δώρα ανταμοιβής.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RewardsPage; 