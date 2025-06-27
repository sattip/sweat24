import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, ShoppingCart, Plus, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { productsService } from "@/services/productsService";
import { toast } from "sonner";

const StorePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  // Fetch products based on current filters
  const { 
    data: products, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['products', activeCategory, searchTerm],
    queryFn: () => {
      const filters: any = {};
      if (activeCategory !== 'all') {
        filters.category = activeCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      return productsService.getAllProducts(filters);
    },
  });

  const filteredProducts = products || [];

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
        
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Αποτυχία φόρτωσης προϊόντων: {error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all" className="mb-6">
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
          </TabsList>
          
          {/* Loading State */}
          {isLoading && (
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Products Content */}
          {!isLoading && (
            <>
              <TabsContent value="all" className="mt-4">
                <ProductGrid products={filteredProducts} />
              </TabsContent>
              
              <TabsContent value="supplements" className="mt-4">
                <ProductGrid products={filteredProducts} />
              </TabsContent>
              
              <TabsContent value="apparel" className="mt-4">
                <ProductGrid products={filteredProducts} />
              </TabsContent>
              
              <TabsContent value="accessories" className="mt-4">
                <ProductGrid products={filteredProducts} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

interface ProductGridProps {
  products: any[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Δεν βρέθηκαν προϊόντα</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

interface ProductCardProps {
  product: any;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  
  const getStockBadge = () => {
    const stockStatus = productsService.getStockStatus(product);
    switch (stockStatus) {
      case 'low_stock':
        return <Badge variant="destructive">Λίγα σε απόθεμα</Badge>;
      case 'out_of_stock':
        return <Badge variant="outline">Εξαντλημένο</Badge>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      supplements: 'Συμπληρώματα',
      apparel: 'Ρούχα',
      equipment: 'Εξοπλισμός',
      accessories: 'Αξεσουάρ'
    };
    return labels[category] || category;
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-48 bg-muted cursor-pointer relative" 
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-primary">
            Προτεινόμενο
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">
              {getCategoryLabel(product.category)}
            </Badge>
            {getStockBadge()}
          </div>
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
        <div className="font-semibold">
          {productsService.formatPrice(product.price)}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          Περισσότερα
        </Button>
        <Button 
          className="w-12" 
          size="icon"
          disabled={!productsService.isInStock(product)}
          onClick={(e) => {
            e.stopPropagation();
            toast.success('Προστέθηκε στο καλάθι!');
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StorePage;
