import React, { useState, useEffect } from "react";
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
import { ChevronLeft, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import * as API from "@/config/api";

interface Product {
  id: number;
  name: string;
  price: number | string;
  description?: string;
  image_url?: string;
  category: string;
  stock_quantity?: number;
}

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await API.apiRequest(`/store/products/id/${productId}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Δεν ήταν δυνατή η φόρτωση του προϊόντος");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id.toString(),
      name: product.name,
      price: Number(product.price),
      quantity,
      image: product.image_url || "/placeholder.svg",
      options: selectedOptions,
    });

    toast.success(`${quantity} x ${product.name} προστέθηκε στο καλάθι σας`);
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      supplements: "Συμπληρώματα",
      apparel: "Ρούχα",
      accessories: "Αξεσουάρ",
      equipment: "Εξοπλισμός",
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Το προϊόν δεν βρέθηκε</h1>
            <Link to="/store">
              <Button>Επιστροφή στο Κατάστημα</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity === 0;
  const lowStock = product.stock_quantity && product.stock_quantity < 10;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-7xl mx-auto">
        {/* Back button */}
        <Link to="/store" className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Πίσω στο Κατάστημα
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card className="overflow-hidden">
            <img 
              src={product.image_url || "/placeholder.svg"} 
              alt={product.name}
              className="w-full h-[500px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </Card>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {getCategoryLabel(product.category)}
              </Badge>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mt-4">
                €{Number(product.price).toFixed(2)}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Περιγραφή</h3>
              <p className="text-muted-foreground">
                {product.description || "Δεν υπάρχει διαθέσιμη περιγραφή"}
              </p>
            </div>
            
            {/* Stock Status */}
            {isOutOfStock ? (
              <Badge variant="destructive">Εξαντλήθηκε</Badge>
            ) : lowStock ? (
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                Μόνο {product.stock_quantity} διαθέσιμα
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Διαθέσιμο
              </Badge>
            )}
            
            {/* Quantity Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ποσότητα</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={product.stock_quantity ? quantity >= product.stock_quantity : false}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Add to Cart Button */}
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isOutOfStock ? "Μη Διαθέσιμο" : "Προσθήκη στο Καλάθι"}
            </Button>
            
            {/* Product Info */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Διαθεσιμότητα</span>
                  <span className="font-medium">
                    {isOutOfStock ? "Εξαντλήθηκε" : "Διαθέσιμο"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Κατηγορία</span>
                  <span className="font-medium">{getCategoryLabel(product.category)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Κωδικός</span>
                  <span className="font-medium">SW24-{product.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailsPage;