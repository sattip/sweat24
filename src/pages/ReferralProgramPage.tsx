
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Copy, Facebook, Instagram, Mail, Share2, Twitter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ReferralProgramPage = () => {
  const [copied, setCopied] = useState(false);
  
  // Mock data for the referral program
  const referralData = {
    code: "JOHN50",
    link: "sweat24.com/join?ref=JOHN50",
    referrals: 2,
    nextRewardAt: 3,
    nextReward: "50% off next month",
    rewards: [
      { name: "Free Personal Training Session", status: "Available", expiry: "2024-07-15" },
      { name: "50% Off Protein Shake", status: "Redeemed", expiry: "2024-04-01" }
    ],
    friends: [
      { name: "Sarah Johnson", joinDate: "2024-03-15" },
      { name: "Mike Peters", joinDate: "2024-04-02" }
    ]
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Invite Friends & Earn Rewards</h1>
          <p className="text-muted-foreground mt-2">
            Share Sweat24 with friends and earn exclusive rewards!
          </p>
        </div>
        
        {/* Program Explanation Card */}
        <Card className="mb-6 border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-semibold">Invite friends to join Sweat24 and earn amazing rewards:</span>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><span className="font-medium">1 referral</span> = Free personal training session</li>
              <li><span className="font-medium">3 referrals</span> = 50% off your next month</li>
              <li><span className="font-medium">5 referrals</span> = One month free membership!</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Referral Code & Sharing */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Referral Link</CardTitle>
            <CardDescription>Share this unique code with friends</CardDescription>
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
                  <span className="sr-only">Copy link</span>
                </Button>
              </div>
              <div>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto" 
                  onClick={() => copyToClipboard(referralData.code)}
                >
                  Copy Code: {referralData.code}
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <p className="text-sm font-medium mb-3">Share via:</p>
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
                  <span>More</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Referral Progress</CardTitle>
            <CardDescription>
              {referralData.nextRewardAt - referralData.referrals === 1 
                ? "Just 1 more referral to earn your next reward!" 
                : `${referralData.nextRewardAt - referralData.referrals} more referrals for your next reward!`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-full flex items-center justify-center h-14 w-14 text-primary font-bold text-xl">
                {referralData.referrals}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Progress to {referralData.nextReward}
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
              <CardTitle className="text-xl">Your Rewards</CardTitle>
              <CardDescription>Rewards you've earned through referrals</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.rewards.length > 0 ? (
                <div className="space-y-4">
                  {referralData.rewards.map((reward, index) => (
                    <div key={index} className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
                      <div>
                        <p className="font-medium text-sm">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {reward.status === "Available" 
                            ? `Expires: ${new Date(reward.expiry).toLocaleDateString()}`
                            : `Redeemed on: ${new Date(reward.expiry).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div>
                        {reward.status === "Available" ? (
                          <Button size="sm" variant="default">Redeem</Button>
                        ) : (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">Redeemed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    You haven't earned any rewards yet. Start inviting friends!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Referred Friends Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Referred Friends</CardTitle>
              <CardDescription>Friends who joined using your referral</CardDescription>
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
                          Joined: {new Date(friend.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    None of your friends have joined yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Terms & Conditions */}
        <div className="mt-6 text-center">
          <Link to="/terms-referral" className="text-sm text-primary underline">
            View Terms & Conditions
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ReferralProgramPage;
