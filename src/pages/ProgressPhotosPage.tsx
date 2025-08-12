
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Camera, X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Camera as DeviceCamera } from "@capacitor/camera";

// Mock data for progress photos
interface ProgressPhoto {
  id: number;
  imageUrl: string;
  date: string;
  caption?: string;
}

// Group photos by month
interface GroupedPhotos {
  [monthYear: string]: ProgressPhoto[];
}

const mockProgressPhotos: ProgressPhoto[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2670&auto=format&fit=crop",
    date: "20 Μαΐου 2025",
    caption: "Πρώτος μήνας προπόνησης"
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2670&auto=format&fit=crop",
    date: "10 Μαΐου 2025",
    caption: "Αρχίζω να βλέπω διαμόρφωση"
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2669&auto=format&fit=crop",
    date: "25 Απριλίου 2025"
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2574&auto=format&fit=crop",
    date: "10 Απριλίου 2025",
    caption: "Δύο μήνες μετά"
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1616803689943-5601631c7fec?q=80&w=2670&auto=format&fit=crop",
    date: "28 Μαρτίου 2025"
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2940&auto=format&fit=crop",
    date: "15 Μαρτίου 2025",
    caption: "Ξεκινώντας το ταξίδι μου στη φυσική κατάσταση"
  },
];

// Group photos by month
const groupPhotosByMonth = (photos: ProgressPhoto[]): GroupedPhotos => {
  const grouped: GroupedPhotos = {};
  
  photos.forEach(photo => {
    // Extract month from Greek date format
    const monthMap: { [key: string]: string } = {
      'Μαΐου': 'Μάιος',
      'Απριλίου': 'Απρίλιος', 
      'Μαρτίου': 'Μάρτιος'
    };
    
    const parts = photo.date.split(' ');
    const month = parts[1];
    const year = parts[2];
    const monthYear = `${monthMap[month] || month} ${year}`;
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(photo);
  });
  
  return grouped;
};

const ProgressPhotosPage = () => {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [showEmptyState, setShowEmptyState] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // For demo purposes, we'll show the empty state if showEmptyState is true
  const hasPhotos = !showEmptyState && mockProgressPhotos.length > 0;
  
  const sortedPhotos = [...mockProgressPhotos].sort((a, b) => {
    // For Greek dates, we need a different sorting approach
    return sortOrder === "newest" ? b.id - a.id : a.id - b.id;
  });
  
  const groupedPhotos = groupPhotosByMonth(sortedPhotos);
  const flatPhotos = sortedPhotos; // Used for navigation in the full-screen view
  
  const handlePhotoClick = (photo: ProgressPhoto) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(flatPhotos.findIndex(p => p.id === photo.id));
  };
  
  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      setSelectedPhoto(flatPhotos[currentPhotoIndex - 1]);
    }
  };
  
  const handleNextPhoto = () => {
    if (currentPhotoIndex < flatPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      setSelectedPhoto(flatPhotos[currentPhotoIndex + 1]);
    }
  };
  
  const handleDeletePhoto = (id: number) => {
    // In a real app, this would make an API call to delete the photo
    toast.success("Η φωτογραφία διαγράφηκε επιτυχώς");
    setSelectedPhoto(null);
  };
  
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`Επιλέχθηκαν ${files.length} φωτογραφίες`);
    // TODO: Upload to backend when API is ready
    e.currentTarget.value = "";
  };

  const handleUploadPhoto = async () => {
    try {
      if (Capacitor.getPlatform() !== "web") {
        const result = await DeviceCamera.pickImages({ quality: 85, limit: 10 });
        const count = result.photos?.length || 0;
        if (count > 0) {
          toast.success(`Επιλέχθηκαν ${count} φωτογραφίες`);
        }
      } else {
        fileInputRef.current?.click();
      }
    } catch {}
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Φωτογραφίες Προόδου</h1>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTips(!showTips)}
              title="Συμβουλές Φωτογραφίας"
            >
              <Info className="h-4 w-4" />
            </Button>
            
            <Select value={sortOrder} onValueChange={(value) => {
              if (value === "empty") {
                setShowEmptyState(true);
              } else {
                setShowEmptyState(false);
                setSortOrder(value as "newest" | "oldest");
              }
            }}>
              <SelectTrigger className="w-[140px] sm:w-[180px]">
                <SelectValue placeholder="Σειρά ταξινόμησης" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Νεότερες Πρώτα</SelectItem>
                <SelectItem value="oldest">Παλαιότερες Πρώτα</SelectItem>
                <SelectItem value="empty">Εμφάνιση Άδειας Κατάστασης</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleUploadPhoto} className="whitespace-nowrap">
              <Camera className="h-4 w-4 mr-2" />
              Προσθήκη Φωτογραφίας
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>
        </div>
        
        {/* Tips Dialog */}
        <Dialog open={showTips} onOpenChange={setShowTips}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Συμβουλές για Φωτογραφίες Προόδου</DialogTitle>
              <DialogDescription>
                Βελτιώστε την ποιότητα των φωτογραφιών προόδου σας
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-medium">Η Συνέπεια είναι το Κλειδί</h3>
                <p className="text-sm text-muted-foreground">
                  Τράβα φωτογραφίες την ίδια ώρα της ημέρας, στο ίδιο φωτισμό, 
                  φορώντας παρόμοια ρούχα και στις ίδιες πόζες.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Φωτισμός</h3>
                <p className="text-sm text-muted-foreground">
                  Χρησιμοποίησε φυσικό φως όταν είναι δυνατόν και αποφεύγετε σκληρές σκιές.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Πολλαπλές Γωνίες</h3>
                <p className="text-sm text-muted-foreground">
                  Τράβα φωτογραφίες από μπροστά, από τα πλάγια και από πίσω για πλήρη εικόνα της προόδου σου.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Συχνότητα</h3>
                <p className="text-sm text-muted-foreground">
                  Τράβα φωτογραφίες κάθε 2-4 εβδομάδες για να παρακολουθείς αξιοσημείωτες αλλαγές.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowTips(false)}>Κλείσιμο</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {hasPhotos ? (
          <div className="space-y-8">
            {Object.entries(groupedPhotos).map(([monthYear, photos]) => (
              <div key={monthYear} className="space-y-3">
                <h2 className="text-lg font-semibold text-muted-foreground">{monthYear}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <Card 
                      key={photo.id}
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="aspect-square relative">
                        <img 
                          src={photo.imageUrl} 
                          alt={`Φωτογραφία προόδου από ${photo.date}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-primary" />
                            {photo.date}
                          </div>
                        </div>
                        {photo.caption && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">{photo.caption}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/40 rounded-full p-6 mb-4">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Δεν υπάρχουν ακόμη φωτογραφίες προόδου</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Ανέβασε την πρώτη σου φωτογραφία για να ξεκινήσεις να παρακολουθείς τη μεταμόρφωσή σου!
            </p>
            <Button onClick={handleUploadPhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Μεταφόρτωση Φωτογραφίας
            </Button>
          </div>
        )}
        
        {/* Full Screen Photo View */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedPhoto(null)}>
                <X className="h-4 w-4 mr-2" />
                Κλείσιμο
              </Button>
              <span className="font-medium">
                {currentPhotoIndex + 1} από {flatPhotos.length}
              </span>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
              >
                Διαγραφή
              </Button>
            </div>
            
            {/* Photo */}
            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={`Φωτογραφία προόδου από ${selectedPhoto.date}`}
                className="max-h-full max-w-full object-contain"
              />
              
              {/* Navigation arrows */}
              {currentPhotoIndex > 0 && (
                <Button 
                  variant="outline"
                  size="icon"
                  className="absolute left-4 rounded-full"
                  onClick={handlePreviousPhoto}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              
              {currentPhotoIndex < flatPhotos.length - 1 && (
                <Button 
                  variant="outline"
                  size="icon"
                  className="absolute right-4 rounded-full"
                  onClick={handleNextPhoto}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span>{selectedPhoto.date}</span>
              </div>
              {selectedPhoto.caption && (
                <p className="text-sm text-muted-foreground">{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProgressPhotosPage;
