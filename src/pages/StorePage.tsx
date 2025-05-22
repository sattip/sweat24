
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, ShoppingCart, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";

// Mock data for the store
const products = [
  {
    id: "1",
    name: "Premium Protein Powder",
    price: 59.99,
    description: "High-quality whey protein for optimal muscle recovery.",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
    category: "supplements",
  },
  {
    id: "2",
    name: "Performance T-Shirt",
    price: 34.99,
    description: "Moisture-wicking fabric for intense workouts.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    category: "apparel",
  },
  {
    id: "3",
    name: "Sweat24 Water Bottle",
    price: 24.99,
    description: "BPA-free 32oz water bottle with measurement markings.",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
    category: "accessories",
  },
  {
    id: "4",
    name: "Pre-Workout Formula",
    price: 49.99,
    description: "Energy-boosting formula to maximize your workout.",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop",
    category: "supplements",
  },
  {
    id: "5",
    name: "Compression Shorts",
    price: 29.99,
    description: "Supportive compression shorts for high-intensity training.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    category: "apparel",
  },
  {
    id: "6",
    name: "Fitness Tracker",
    price: 129.99,
    description: "Track your heart rate, steps, and calories burned.",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
    category: "accessories",
  },
];

const StorePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Store</h1>
          <Link to="/cart">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">View cart</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="w-full justify-start overflow-auto pb-px">
            <TabsTrigger 
              value="all" 
              onClick={() => setActiveCategory("all")}
            >
              All Products
            </TabsTrigger>
            <TabsTrigger 
              value="supplements" 
              onClick={() => setActiveCategory("supplements")}
            >
              Supplements
            </TabsTrigger>
            <TabsTrigger 
              value="apparel" 
              onClick={() => setActiveCategory("apparel")}
            >
              Apparel
            </TabsTrigger>
            <TabsTrigger 
              value="accessories" 
              onClick={() => setActiveCategory("accessories")}
            >
              Accessories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="supplements" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="apparel" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="accessories" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-48 bg-muted cursor-pointer" 
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="mb-2">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
          <h3 
            className="font-medium text-lg cursor-pointer hover:text-primary transition-colors" 
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="font-semibold">${product.price.toFixed(2)}</div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          View Details
        </Button>
        <Button className="w-12" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StorePage;
