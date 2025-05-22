
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/hooks/use-cart";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  
  const handleIncrementQuantity = (itemId, currentQuantity, options) => {
    updateQuantity(itemId, currentQuantity + 1, options);
  };
  
  const handleDecrementQuantity = (itemId, currentQuantity, options) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1, options);
    } else {
      removeItem(itemId, options);
    }
  };
  
  const handleRemoveItem = (itemId, options) => {
    removeItem(itemId, options);
  };
  
  const formatOptions = (options) => {
    if (!options) return null;
    
    return Object.entries(options).map(([key, value]) => (
      <span key={key} className="text-sm text-muted-foreground">
        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
      </span>
    ));
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/store")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        
        {items.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <p className="mb-4">Your cart is empty</p>
              <Button onClick={() => navigate("/store")}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((item, index) => (
                <Card key={`${item.id}-${index}`} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/4 h-24 sm:h-auto bg-muted">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="flex flex-col mt-1 space-y-1">
                            {formatOptions(item.options)}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id, item.options)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDecrementQuantity(item.id, item.quantity, item.options)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-3 text-center w-6">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleIncrementQuantity(item.id, item.quantity, item.options)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxes</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
