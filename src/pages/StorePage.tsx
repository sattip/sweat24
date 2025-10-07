import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, ShoppingCart, Plus, Loader2, Package } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { storeProductService, orderHistoryService } from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import OrderHistoryPage from "./OrderHistoryPage";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.image_url || "/logo-light.png",
      options: {},
    });

    toast.success(`${product.name} προστέθηκε στο καλάθι σας`);
  };

  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Card className="h-full hover:border-primary transition-colors cursor-pointer overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="aspect-square w-full overflow-hidden bg-muted relative">
        <img 
          src={product.image_url || "/logo-light.png"} 
          alt={product.name} 
          className="h-full w-full object-contain transition-all hover:scale-105 p-4"
          onError={(e) => {
            e.currentTarget.src = "/logo-light.png";
          }}
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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMainTab, setActiveMainTab] = useState(
    searchParams.get('tab') === 'orders' ? 'orders' : 'products'
  );
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

    if (activeMainTab === 'products') {
      fetchProducts();
    }
  }, [activeCategory, activeMainTab]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading && activeMainTab === 'products') {
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

  if (error && activeMainTab === 'products') {
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

        {/* Main Store Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Προϊόντα
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Οι Παραγγελίες μου
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
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
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders">
            <OrderHistoryContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Separate component for Order History content to avoid re-rendering header
const OrderHistoryContent = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderHistory();
    
    // Set up polling every 30 seconds for real-time updates
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling for order updates in store...');
      fetchOrderHistory();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      console.log('🛑 Stopping order polling in store');
      clearInterval(pollingInterval);
    };
  }, [user]);

  const fetchOrderHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await orderHistoryService.getOrderHistory(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Σφάλμα κατά τη φόρτωση του ιστορικού παραγγελιών');
    } finally {
      setLoading(false);
    }
  };

  // Import the main content from OrderHistoryPage without the header
  return <OrderHistoryPage hideHeader={true} orders={orders} loading={loading} />;
};

export default StorePage;