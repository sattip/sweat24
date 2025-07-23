
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
import { apiRequest } from "@/config/api";
import { toast } from "sonner";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
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
    
    // Allow guest checkout - no authentication required

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        user_id: user?.id || 1, // Use logged in user or default to admin user for guest orders
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      // Submit order
      const response = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        // Pass order number to confirmation page
        navigate("/order-confirmation", { 
          state: { orderNumber: result.order.order_number } 
        });
      } else {
        toast.error(result.message || "Σφάλμα κατά την υποβολή της παραγγελίας");
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Σφάλμα κατά την υποβολή της παραγγελίας");
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
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity} x {item.name}
                      {item.options && Object.values(item.options).length > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {Object.entries(item.options)
                            .map(([key, value]) => `${value}`)
                            .join(', ')}
                        </span>
                      )}
                    </span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between">
                  <span>Υποσύνολο</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>Φόροι</span>
                  <span>Υπολογισμός στο ταμείο</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Σύνολο</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
