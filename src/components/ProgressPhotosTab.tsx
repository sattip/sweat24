import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Calendar, Camera, X, ChevronLeft, ChevronRight, Info, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Camera as DeviceCamera } from "@capacitor/camera";
import { progressPhotoService, type ProgressPhoto } from "@/services/progressPhotoService";
import { useAuth } from "@/contexts/AuthContext";

// Group photos by month
interface GroupedPhotos {
  [monthYear: string]: ProgressPhoto[];
}

// Group photos by month
const groupPhotosByMonth = (photos: ProgressPhoto[]): GroupedPhotos => {
  const grouped: GroupedPhotos = {};
  
  photos.forEach(photo => {
    // Extract month from Greek date format
    const monthMap: { [key: string]: string } = {
      'Ιανουαρίου': 'Ιανουάριος',
      'Φεβρουαρίου': 'Φεβρουάριος',
      'Μαρτίου': 'Μάρτιος',
      'Απριλίου': 'Απρίλιος',
      'Μαΐου': 'Μάιος',
      'Ιουνίου': 'Ιούνιος',
      'Ιουλίου': 'Ιούλιος',
      'Αυγούστου': 'Αύγουστος',
      'Σεπτεμβρίου': 'Σεπτέμβριος',
      'Οκτωβρίου': 'Οκτώβριος',
      'Νοεμβρίου': 'Νοέμβριος',
      'Δεκεμβρίου': 'Δεκέμβριος'
    };
    
    const parts = photo.date.split(' ');
    if (parts.length >= 3) {
      const month = parts[1];
      const year = parts[2];
      const monthYear = `${monthMap[month] || month} ${year}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(photo);
    }
  });
  
  return grouped;
};

export const ProgressPhotosTab = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [showTips, setShowTips] = useState<boolean>(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCaption, setUploadCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load photos on component mount
  useEffect(() => {
    loadPhotos();
  }, []);
  
  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await progressPhotoService.getPhotos();
      console.log('📸 Progress Photos from API:', data);
      console.log('📸 Number of photos:', data.length);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Αποτυχία φόρτωσης φωτογραφιών');
      // Set empty array on error to show empty state
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };
  
  const hasPhotos = photos.length > 0;
  
  const sortedPhotos = [...photos].sort((a, b) => {
    // Sort by ID as proxy for date
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
  
  const handleDeletePhoto = async (id: number) => {
    try {
      await progressPhotoService.deletePhoto(id);
      toast.success("Η φωτογραφία διαγράφηκε επιτυχώς");
      setSelectedPhoto(null);
      // Remove from local state
      setPhotos(photos.filter(p => p.id !== id));
    } catch (error) {
      toast.error("Αποτυχία διαγραφής φωτογραφίας");
    }
  };
  
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Validate files
    const errors = progressPhotoService.validateFiles(fileArray);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      e.currentTarget.value = "";
      return;
    }
    
    // Show upload dialog with caption option
    setSelectedFiles(fileArray);
    setShowUploadDialog(true);
    e.currentTarget.value = "";
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploading(true);
      const response = await progressPhotoService.uploadPhotos(selectedFiles, uploadCaption);
      
      // Add new photos to the list
      setPhotos([...response.photos, ...photos]);
      
      toast.success(response.message);
      setShowUploadDialog(false);
      setSelectedFiles([]);
      setUploadCaption("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Αποτυχία μεταφόρτωσης");
    } finally {
      setUploading(false);
    }
  };
  
  const handleUploadPhoto = async () => {
    try {
      if (Capacitor.getPlatform() !== "web") {
        // Mobile: Use camera/gallery
        const result = await DeviceCamera.pickImages({ quality: 85, limit: 10 });
        const count = result.photos?.length || 0;
        if (count > 0) {
          // TODO: Handle mobile photo upload when Capacitor integration is ready
          toast.info("Mobile upload θα υλοποιηθεί σύντομα");
        }
      } else {
        // Web: Use file input
        fileInputRef.current?.click();
      }
    } catch (error) {
      console.error('Error selecting photos:', error);
    }
  };
  
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold">Φωτογραφίες Προόδου</h2>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTips(!showTips)}
            title="Συμβουλές Φωτογραφίας"
          >
            <Info className="h-4 w-4" />
          </Button>
          
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
            <SelectTrigger className="w-[140px] sm:w-[180px]">
              <SelectValue placeholder="Σειρά ταξινόμησης" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Νεότερες Πρώτα</SelectItem>
              <SelectItem value="oldest">Παλαιότερες Πρώτα</SelectItem>
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
      
      {/* Upload Dialog with Caption */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Μεταφόρτωση Φωτογραφιών</DialogTitle>
            <DialogDescription>
              {selectedFiles.length === 1 
                ? 'Επιλέχθηκε 1 φωτογραφία' 
                : `Επιλέχθηκαν ${selectedFiles.length} φωτογραφίες`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="caption">Περιγραφή (προαιρετικό)</Label>
              <Input
                id="caption"
                placeholder="Προσθέστε μια περιγραφή για τις φωτογραφίες σας..."
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {selectedFiles.length > 1 && 'Η περιγραφή θα εφαρμοστεί σε όλες τις φωτογραφίες'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUploadDialog(false);
                setSelectedFiles([]);
                setUploadCaption("");
              }}
              disabled={uploading}
            >
              Ακύρωση
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Μεταφόρτωση...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Μεταφόρτωση
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : hasPhotos ? (
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
    </>
  );
};