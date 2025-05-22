
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";

// Mock data for the product details
const products = [
  {
    id: "1",
    name: "Premium Protein Powder",
    price: 59.99,
    description: "High-quality whey protein for optimal muscle recovery. Our premium formula contains 25g of protein per serving with minimal carbs and fat. Ideal for post-workout recovery and muscle building. Available in multiple flavors.",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
    category: "supplements",
    options: [
      { name: "flavor", values: ["Chocolate", "Vanilla", "Strawberry", "Cookies & Cream"] }
    ]
  },
  {
    id: "2",
    name: "Performance T-Shirt",
    price: 34.99,
    description: "Moisture-wicking fabric for intense workouts. This high-performance t-shirt keeps you cool and dry during even the most intense training sessions. The lightweight, breathable material provides maximum comfort and mobility.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    category: "apparel",
    options: [
      { name: "size", values: ["S", "M", "L", "XL", "XXL"] }
    ]
  },
  {
    id: "3",
    name: "Sweat24 Water Bottle",
    price: 24.99,
    description: "BPA-free 32oz water bottle with measurement markings. Stay hydrated during your workouts with our durable water bottle. Features a leak-proof lid and easy-grip design. The measurement markings help you track your water intake throughout the day.",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
    category: "accessories",
    options: [
      { name: "color", values: ["Blue", "Black", "Red", "Clear"] }
    ]
  },
  {
    id: "4",
    name: "Pre-Workout Formula",
    price: 49.99,
    description: "Energy-boosting formula to maximize your workout. Our scientifically formulated pre-workout provides clean energy, enhanced focus, and improved endurance. Contains caffeine, beta-alanine, and citrulline malate for maximum performance.",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop",
    category: "supplements",
    options: [
      { name: "flavor", values: ["Fruit Punch", "Blue Raspberry", "Watermelon", "Orange"] }
    ]
  },
  {
    id: "5",
    name: "Compression Shorts",
    price: 29.99,
    description: "Supportive compression shorts for high-intensity training. These shorts provide muscle support and reduce fatigue during workouts. The moisture-wicking fabric keeps you dry, while the flatlock seams prevent chafing for maximum comfort.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    category: "apparel",
    options: [
      { name: "size", values: ["S", "M", "L", "XL"] }
    ]
  },
  {
    id: "6",
    name: "Fitness Tracker",
    price: 129.99,
    description: "Track your heart rate, steps, and calories burned. Our fitness tracker helps you monitor your workouts and daily activity. Features include heart rate monitoring, step counting, sleep tracking, and smartphone notifications. Water-resistant up to 50 meters.",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
    category: "accessories",
    options: [
      { name: "color", values: ["Black", "Silver", "Rose Gold"] }
    ]
  },
];

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === productId);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);
  
  const handleOptionChange = (optionName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };
  
  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
    });
    
    // Navigate to cart page
    navigate("/cart");
  };
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate("/store")}>Return to Store</Button>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/store")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Store
          </Button>
          
          <div className="ml-auto">
            <Link to="/cart">
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">View cart</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-lg overflow-hidden h-[300px] md:h-[400px]">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <Badge variant="outline" className="mb-2">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold mb-4">${product.price.toFixed(2)}</p>
            
            <div className="mb-6">
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            
            <Card className="mb-6">
              <CardContent className="p-4 space-y-4">
                {product.options && product.options.map((option) => (
                  <div key={option.name} className="space-y-2">
                    <label className="text-sm font-medium">
                      {option.name.charAt(0).toUpperCase() + option.name.slice(1)}:
                    </label>
                    <Select 
                      value={selectedOptions[option.name] || ""}
                      onValueChange={(value) => handleOptionChange(option.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${option.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-4 text-center w-8">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={incrementQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  onClick={handleAddToCart}
                  disabled={product.options && product.options.some(option => !selectedOptions[option.name])}
                >
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailsPage;
