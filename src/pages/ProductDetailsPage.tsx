
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
    name: "Premium Πρωτεΐνη",
    price: 59.99,
    description: "Υψηλής ποιότητας whey πρωτεΐνη για βέλτιστη ανάκαμψη μυών. Η premium φόρμουλά μας περιέχει 25g πρωτεΐνης ανά μερίδα με ελάχιστους υδατάνθρακες και λίπη. Ιδανική για ανάκαμψη μετά την προπόνηση και μυϊκή ανάπτυξη. Διαθέσιμη σε πολλές γεύσεις.",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
    category: "συμπληρώματα",
    options: [
      { name: "γεύση", values: ["Σοκολάτα", "Βανίλια", "Φράουλα", "Μπισκότα & Κρέμα"] }
    ]
  },
  {
    id: "2",
    name: "Performance T-Shirt",
    price: 34.99,
    description: "Ύφασμα που απομακρύνει την υγρασία για έντονες προπονήσεις. Αυτό το υψηλής απόδοσης t-shirt σας κρατάει δροσερούς και στεγνούς ακόμη και στις πιο έντονες προπονήσεις. Το ελαφρύ, αναπνεύσιμο υλικό παρέχει μέγιστη άνεση και κινητικότητα.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    category: "ρούχα",
    options: [
      { name: "μέγεθος", values: ["S", "M", "L", "XL", "XXL"] }
    ]
  },
  {
    id: "3",
    name: "Sweat24 Παγούρι",
    price: 24.99,
    description: "Παγούρι 1L χωρίς BPA με ενδείξεις μέτρησης. Μείνετε ενυδατωμένοι κατά τη διάρκεια των προπονήσεων με το ανθεκτικό μας παγούρι. Διαθέτει καπάκι αντιδιαρροής και εργονομικό σχεδιασμό. Οι ενδείξεις μέτρησης σας βοηθούν να παρακολουθείτε την πρόσληψη νερού σας όλη την ημέρα.",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
    category: "αξεσουάρ",
    options: [
      { name: "χρώμα", values: ["Μπλε", "Μαύρο", "Κόκκινο", "Διάφανο"] }
    ]
  },
  {
    id: "4",
    name: "Pre-Workout Φόρμουλα",
    price: 49.99,
    description: "Φόρμουλα ενεργοποίησης για μεγιστοποίηση της προπόνησής σας. Η επιστημονικά σχηματισμένη pre-workout μας παρέχει καθαρή ενέργεια, βελτιωμένη συγκέντρωση και αυξημένη αντοχή. Περιέχει καφεΐνη, beta-alanine και citrulline malate για μέγιστη απόδοση.",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop",
    category: "συμπληρώματα",
    options: [
      { name: "γεύση", values: ["Φρουτένιο Πονς", "Μπλε Βατόμουρο", "Καρπούζι", "Πορτοκάλι"] }
    ]
  },
  {
    id: "5",
    name: "Compression Σορτς",
    price: 29.99,
    description: "Υποστηρικτικό compression σορτς για υψηλής έντασης προπόνηση. Αυτό το σορτς παρέχει μυϊκή υποστήριξη και μειώνει την κόπωση κατά τις προπονήσεις. Το ύφασμα που απομακρύνει την υγρασία σας κρατάει στεγνούς, ενώ οι flatlock ραφές αποτρέπουν τον ερεθισμό για μέγιστη άνεση.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    category: "ρούχα",
    options: [
      { name: "μέγεθος", values: ["S", "M", "L", "XL"] }
    ]
  },
  {
    id: "6",
    name: "Fitness Tracker",
    price: 129.99,
    description: "Παρακολουθήστε τον καρδιακό ρυθμό, τα βήματα και τις καμένες θερμίδες. Το fitness tracker μας σας βοηθάει να παρακολουθείτε τις προπονήσεις και την καθημερινή δραστηριότητα. Οι λειτουργίες περιλαμβάνουν παρακολούθηση καρδιακού ρυθμού, καταμέτρηση βημάτων, παρακολούθηση ύπνου και ειδοποιήσεις smartphone. Αδιάβροχο έως 50 μέτρα.",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop",
    category: "αξεσουάρ",
    options: [
      { name: "χρώμα", values: ["Μαύρο", "Ασημί", "Ροζ Χρυσό"] }
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
      title: "Προστέθηκε στο καλάθι",
      description: `${quantity} x ${product.name} προστέθηκε στο καλάθι σας`,
    });
    
    // Navigate to cart page
    navigate("/cart");
  };
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Το προϊόν δεν βρέθηκε</h1>
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/store")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Επιστροφή στο Κατάστημα
          </Button>
          
          <div className="ml-auto">
            <Link to="/cart">
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Προβολή καλαθιού</span>
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
            <p className="text-2xl font-semibold mb-4">{product.price.toFixed(2)}€</p>
            
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
                        <SelectValue placeholder={`Επιλέξτε ${option.name}`} />
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
                  <label className="text-sm font-medium">Ποσότητα:</label>
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
                  Προσθήκη στο Καλάθι - {(product.price * quantity).toFixed(2)}€
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
