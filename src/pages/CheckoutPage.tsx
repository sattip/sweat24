
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/AuthContext";
import { usePoints } from "@/contexts/PointsContext";
import * as API from "@/config/api";
import { toast } from "sonner";
import { isRewardCartItem } from "@/utils/rewardUtils";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { state: pointsState, actions: pointsActions } = usePoints();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    pickupOption: "gym",
    notes: "",
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRadioChange = (value) => {
    setFormData(prev => ({
      ...prev,
      pickupOption: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      // Separate regular items from reward items
      const regularItems = items.filter(item => !isRewardCartItem(item));
      const rewardItems = items.filter(item => isRewardCartItem(item));
      
      console.log('🛒 Regular items:', regularItems);
      console.log('🎁 Reward items:', rewardItems);
      
      // Calculate total points needed for rewards
      const totalPointsNeeded = rewardItems.reduce((sum, item) => {
        return sum + (parseInt(item.options?.points_cost || '0') * item.quantity);
      }, 0);
      
      console.log('💰 Total points needed:', totalPointsNeeded);
      console.log('💰 User points balance:', pointsState.balance);
      
      // Check if user has enough points for rewards
      if (rewardItems.length > 0 && totalPointsNeeded > pointsState.balance) {
        toast.error(`Χρειάζεστε ${totalPointsNeeded} πόντους αλλά έχετε μόνο ${pointsState.balance}`);
        setLoading(false);
        return;
      }

      // Process rewards first (redeem points)
      const rewardResults = [];
      for (const rewardItem of rewardItems) {
        try {
          const rewardId = parseInt(rewardItem.id.replace('reward-', ''));
          const result = await pointsActions.redeemReward(rewardId);
          if (result) {
            rewardResults.push({
              ...result,
              quantity: rewardItem.quantity
            });
            console.log('🎉 Reward redeemed:', result);
          }
        } catch (error) {
          console.error('❌ Error redeeming reward:', error);
          toast.error(`Σφάλμα εξαργύρωσης: ${rewardItem.name}`);
          setLoading(false);
          return;
        }
      }

      // If there are regular items, create a regular order
      let orderResult = null;
      if (regularItems.length > 0) {
        const orderData = {
          user_id: user?.id || 1,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          notes: formData.notes,
          items: regularItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          }))
        };

        const response = await API.apiRequest('/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        });

        orderResult = await response.json();
        
        if (!orderResult.success) {
          toast.error(orderResult.message || "Σφάλμα κατά την υποβολή της παραγγελίας");
          setLoading(false);
          return;
        }
      }

      // Success! Clear cart and navigate
      clearCart();
      
      // Show success message
      if (rewardResults.length > 0 && regularItems.length > 0) {
        toast.success(`Παραγγελία και ${rewardResults.length} ανταμοιβές ολοκληρώθηκαν επιτυχώς!`);
      } else if (rewardResults.length > 0) {
        toast.success(`${rewardResults.length} ανταμοιβές εξαργυρώθηκαν επιτυχώς!`);
      } else {
        toast.success("Παραγγελία ολοκληρώθηκε επιτυχώς!");
      }
      
      // Navigate to confirmation page
      navigate("/order-confirmation", { 
        state: { 
          orderNumber: orderResult?.order?.order_number || 'REWARDS-' + Date.now(),
          rewardResults: rewardResults
        } 
      });
      
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Σφάλμα κατά την ολοκλήρωση της παραγγελίας");
    } finally {
      setLoading(false);
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Το καλάθι σας είναι άδειο</h1>
          <Button onClick={() => navigate("/store")}>Επιστροφή στο Κατάστημα</Button>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Πίσω στο Καλάθι
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Ολοκλήρωση Παραγγελίας</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Στοιχεία Επικοινωνίας</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Όνομα</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Τηλέφωνο</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Τρόπος Παραλαβής</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-medium">Παραλαβή από το Γυμναστήριο</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Θα παραλάβετε την παραγγελία σας από την υποδοχή του Sweat93 κατά τις ώρες λειτουργίας.
                      Θα σας ειδοποιήσουμε όταν είναι έτοιμη.
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Επιπλέον Σημειώσεις</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    placeholder="Οποιεσδήποτε ειδικές απαιτήσεις ή οδηγίες για την παραγγελία σας"
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? "Υποβολή..." : "Υποβολή Παραγγελίας"}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Σύνοψη Παραγγελίας</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Regular Items */}
                {items.filter(item => !isRewardCartItem(item)).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity} x {item.name}
                      {item.options && Object.values(item.options).length > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {Object.entries(item.options)
                            .filter(([key]) => key !== 'type')
                            .map(([key, value]) => `${value}`)
                            .join(', ')}
                        </span>
                      )}
                    </span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                {/* Reward Items */}
                {items.filter(item => isRewardCartItem(item)).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-purple-700">🎁 Ανταμοιβές με Πόντους</h4>
                      {items.filter(item => isRewardCartItem(item)).map((item, index) => (
                        <div key={`reward-${index}`} className="flex justify-between text-sm">
                          <span>
                            {item.quantity} x {item.name}
                            <span className="block text-xs text-purple-600">
                              {item.options?.points_cost} πόντοι • {item.options?.reward_value}
                            </span>
                          </span>
                          <span className="text-green-600 font-medium">
                            {item.price < 0 ? `€${item.price.toFixed(2)}` : `${item.options?.points_cost} ⭐`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between">
                  <span>Υποσύνολο</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                
                {/* Points Summary */}
                {items.filter(item => isRewardCartItem(item)).length > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Πόντοι προς εξαργύρωση</span>
                    <span>
                      {items.filter(item => isRewardCartItem(item))
                        .reduce((sum, item) => sum + parseInt(item.options?.points_cost || '0'), 0)} ⭐
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-muted-foreground">
                  <span>Φόροι</span>
                  <span>Υπολογισμός στο ταμείο</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Σύνολο</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                
                {/* Points Balance Check */}
                {items.filter(item => isRewardCartItem(item)).length > 0 && (
                  <div className="text-xs text-muted-foreground text-center">
                    Υπόλοιπο πόντων: {pointsState.balance} ⭐
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
