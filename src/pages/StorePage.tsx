import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, ShoppingCart, Plus, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { storeProductService } from "@/services/apiService";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement cart functionality
    console.log("Adding to cart:", product);
    navigate(`/product/${product.id}`);
  };

  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Card className="h-full hover:border-primary transition-colors cursor-pointer overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="aspect-square w-full overflow-hidden bg-muted relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
            -{discountPercentage}%
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg leading-none">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">€{product.price}</span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">€{product.original_price}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button 
          onClick={handleAddToCart} 
          className="w-full"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Προσθήκη στο Καλάθι
        </Button>
      </CardFooter>
    </Card>
  );
};

const StorePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const category = activeCategory === 'all' ? undefined : activeCategory;
        const data = await storeProductService.getAll(category);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Αποτυχία φόρτωσης προϊόντων');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="text-center text-red-500 mt-8">
            {error}
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
          <h1 className="text-3xl font-bold">Κατάστημα</h1>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Αναζήτηση προϊόντων..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeCategory} className="mb-6">
          <TabsList className="w-full justify-start overflow-auto pb-px">
            <TabsTrigger 
              value="all" 
              onClick={() => setActiveCategory("all")}
            >
              Όλα τα Προϊόντα
            </TabsTrigger>
            <TabsTrigger 
              value="supplements" 
              onClick={() => setActiveCategory("supplements")}
            >
              Συμπληρώματα
            </TabsTrigger>
            <TabsTrigger 
              value="apparel" 
              onClick={() => setActiveCategory("apparel")}
            >
              Ρούχα
            </TabsTrigger>
            <TabsTrigger 
              value="accessories" 
              onClick={() => setActiveCategory("accessories")}
            >
              Αξεσουάρ
            </TabsTrigger>
            <TabsTrigger 
              value="equipment" 
              onClick={() => setActiveCategory("equipment")}
            >
              Εξοπλισμός
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-4">
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

export default StorePage;