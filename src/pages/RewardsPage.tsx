import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Crown, Trophy, Calendar, Loader2, Sparkles, Award, TrendingUp } from "lucide-react";
import { loyaltyService } from "@/services/apiService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  const progressPercentage = dashboard?.next_tier
    ? ((dashboard.next_tier.points_required - dashboard.next_tier.points_needed) / dashboard.next_tier.points_required) * 100
    : 0;

  // Tier color mapping
  const getTierColors = (tierName?: string) => {
    const tier = tierName?.toLowerCase() || '';
    if (tier.includes('platinum') || tier.includes('πλατινένιο')) {
      return { bg: 'from-slate-400 to-slate-300', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700', icon: 'text-slate-500' };
    }
    if (tier.includes('gold') || tier.includes('χρυσό')) {
      return { bg: 'from-yellow-500 to-amber-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-500' };
    }
    if (tier.includes('silver') || tier.includes('ασημένιο')) {
      return { bg: 'from-gray-400 to-gray-300', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-600', icon: 'text-gray-500' };
    }
    if (tier.includes('bronze') || tier.includes('χάλκινο')) {
      return { bg: 'from-orange-600 to-orange-400', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-500' };
    }
    // Default (new member)
    return { bg: 'from-amber-500 to-yellow-400', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-500' };
  };

  // Get CSS color for gradient (for inline styles)
  const getGradientColor = (tierName?: string) => {
    const tier = tierName?.toLowerCase() || '';
    if (tier.includes('platinum') || tier.includes('πλατινένιο')) return '#94a3b8'; // slate-400
    if (tier.includes('gold') || tier.includes('χρυσό')) return '#eab308'; // yellow-500
    if (tier.includes('silver') || tier.includes('ασημένιο')) return '#9ca3af'; // gray-400
    if (tier.includes('bronze') || tier.includes('χάλκινο')) return '#ea580c'; // orange-600
    return '#f59e0b'; // amber-500 (default)
  };

  const currentTierColors = getTierColors(dashboard?.current_tier?.name);
  const nextTierColors = getTierColors(dashboard?.next_tier?.name);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      {/* Hero Header */}
      <div className="bg-red-800 text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Πρόγραμμα Ανταμοιβής</h1>
              <p className="text-red-200 text-sm">
                Κερδίστε πόντους και εξαργυρώστε δώρα
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        {dashboard && (
          <>
            {/* Points Card - Hero Style with Progress */}
            <Card className="border-0 shadow-lg bg-white overflow-hidden mb-6">
              <div className={`h-1 bg-gradient-to-r ${currentTierColors.bg}`} />
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-sm ${currentTierColors.text} font-medium mb-1`}>Διαθέσιμοι Πόντοι</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${currentTierColors.text}`}>
                          {typeof dashboard.current_points === 'number' ? dashboard.current_points : 0}
                        </span>
                        <Sparkles className={`h-6 w-6 ${currentTierColors.icon}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Συνολικά κερδισμένοι: {typeof dashboard.total_earned_points === 'number' ? dashboard.total_earned_points : 0} πόντοι
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm ${currentTierColors.badge}`}>
                        <Crown className={`h-5 w-5 ${currentTierColors.icon}`} />
                        <span className="font-semibold">
                          {dashboard.current_tier?.name || 'Νέο Μέλος'}
                        </span>
                      </div>
                      {dashboard.redeemed_rewards_count > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {dashboard.redeemed_rewards_count} δώρα εξαργυρωμένα
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Next Tier Progress - Inside the card */}
                  {dashboard.next_tier && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`h-4 w-4 ${nextTierColors.icon}`} />
                          <span className="text-sm font-medium">Επόμενο Επίπεδο</span>
                        </div>
                        <span className={`text-sm font-semibold ${nextTierColors.text}`}>
                          {dashboard.next_tier.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {dashboard.next_tier.points_needed} πόντοι ακόμα
                      </p>
                      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPercentage}%`,
                            background: `linear-gradient(to right, ${getGradientColor(dashboard?.current_tier?.name)}, ${getGradientColor(dashboard?.next_tier?.name)})`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{typeof dashboard.current_points === 'number' ? dashboard.current_points : 0}</span>
                        <span>{dashboard.next_tier.points_required} πόντοι</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Current Tier Benefits */}
                {dashboard.current_tier?.benefits && dashboard.current_tier.benefits.length > 0 && (
                  <div className="px-6 py-4 border-t bg-gray-50/50">
                    <p className="text-xs text-muted-foreground mb-2">Τα προνόμιά σου:</p>
                    <div className="flex flex-wrap gap-2">
                      {dashboard.current_tier.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Star className={`h-3 w-3 mr-1 ${currentTierColors.icon}`} />
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Available Rewards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold">Διαθέσιμα Δώρα</h2>
          </div>

          {rewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const isRedeeming = redeemingIds.has(reward.id);
                const expirationInfo = formatExpirationDate(reward.expires_at);
                const canAfford = reward.is_affordable && dashboard && dashboard.current_points >= reward.points_required;

                return (
                  <Card
                    key={reward.id}
                    className={cn(
                      "border-0 shadow-lg bg-white overflow-hidden transition-all duration-200",
                      canAfford ? "hover:shadow-xl" : "opacity-70"
                    )}
                  >
                    {/* Colored accent based on category */}
                    <div className={cn(
                      "h-1",
                      reward.category === 'training' && "bg-gradient-to-r from-blue-500 to-blue-400",
                      reward.category === 'product' && "bg-gradient-to-r from-green-500 to-green-400",
                      reward.category === 'premium' && "bg-gradient-to-r from-purple-500 to-purple-400",
                      !reward.category && "bg-gradient-to-r from-red-500 to-red-400"
                    )} />

                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            reward.category === 'training' && "bg-blue-100 text-blue-600",
                            reward.category === 'product' && "bg-green-100 text-green-600",
                            reward.category === 'premium' && "bg-purple-100 text-purple-600",
                            !reward.category && "bg-red-100 text-red-600"
                          )}>
                            {getCategoryIcon(reward.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{reward.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {reward.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {reward.is_limited_time && (
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                            <Calendar className="h-3 w-3 mr-1" />
                            Περιορισμένο
                          </Badge>
                        )}
                        {expirationInfo && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              expirationInfo.includes('σήμερα') || expirationInfo.includes('Έληξε')
                                ? 'border-red-300 text-red-700 bg-red-50'
                                : 'border-gray-300'
                            )}
                          >
                            {expirationInfo}
                          </Badge>
                        )}
                      </div>

                      {/* Points & Action */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span className="font-bold text-lg">{typeof reward.points_required === 'number' ? reward.points_required : 0}</span>
                          <span className="text-sm text-muted-foreground">πόντοι</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRedeemReward(reward.id)}
                          disabled={!canAfford || isRedeeming}
                          className={cn(
                            canAfford
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gray-300 text-gray-500"
                          )}
                        >
                          {isRedeeming ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : canAfford ? (
                            <>
                              <Gift className="h-4 w-4 mr-1" />
                              Εξαργύρωση
                            </>
                          ) : (
                            "Δεν επαρκούν"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="py-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <Gift className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Δεν υπάρχουν διαθέσιμα δώρα</h3>
                <p className="text-muted-foreground text-sm">
                  Σύντομα θα προστεθούν νέα δώρα για εξαργύρωση
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* How to earn points hint */}
        <Card className="border-0 shadow-lg bg-white overflow-hidden mt-6">
          <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg shrink-0">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Πώς κερδίζω πόντους;</h3>
                <p className="text-xs text-muted-foreground">
                  Κερδίζεις πόντους με κάθε προπόνηση που παρακολουθείς, με την αγορά προϊόντων,
                  και με τη συμμετοχή σε ειδικές προσφορές!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RewardsPage; 