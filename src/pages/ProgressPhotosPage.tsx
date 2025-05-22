
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
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
    date: "May 20, 2025",
    caption: "First month of training"
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2670&auto=format&fit=crop",
    date: "May 10, 2025",
    caption: "Starting to see definition"
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2669&auto=format&fit=crop",
    date: "April 25, 2025"
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=2574&auto=format&fit=crop",
    date: "April 10, 2025",
    caption: "Two months in"
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1616803689943-5601631c7fec?q=80&w=2670&auto=format&fit=crop",
    date: "March 28, 2025"
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2940&auto=format&fit=crop",
    date: "March 15, 2025",
    caption: "Starting my fitness journey"
  },
];

// Group photos by month
const groupPhotosByMonth = (photos: ProgressPhoto[]): GroupedPhotos => {
  const grouped: GroupedPhotos = {};
  
  photos.forEach(photo => {
    const date = new Date(photo.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
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
  
  // For demo purposes, we'll show the empty state if showEmptyState is true
  const hasPhotos = !showEmptyState && mockProgressPhotos.length > 0;
  
  const sortedPhotos = [...mockProgressPhotos].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
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
    toast.success("Photo deleted successfully");
    setSelectedPhoto(null);
  };
  
  const handleUploadPhoto = () => {
    // In a real app, this would open the file picker or camera
    toast.success("Photo uploaded successfully");
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Progress Photos</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTips(!showTips)}
              title="Photo Tips"
            >
              <Info className="h-4 w-4" />
            </Button>
            
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="empty">Show Empty State</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleUploadPhoto} className="whitespace-nowrap">
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
        </div>
        
        {/* Tips Dialog */}
        <Dialog open={showTips} onOpenChange={setShowTips}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tips for Progress Photos</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-medium">Consistency is Key</h3>
                <p className="text-sm text-muted-foreground">
                  Take photos at the same time of day, in the same lighting, 
                  wearing similar clothing, and in the same poses.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Lighting</h3>
                <p className="text-sm text-muted-foreground">
                  Use natural light when possible and avoid harsh shadows.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Multiple Angles</h3>
                <p className="text-sm text-muted-foreground">
                  Take photos from the front, side, and back for a complete view of your progress.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Frequency</h3>
                <p className="text-sm text-muted-foreground">
                  Take photos every 2-4 weeks to track noticeable changes.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowTips(false)}>Close</Button>
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
                          alt={`Progress photo from ${photo.date}`} 
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
            <h2 className="text-xl font-semibold mb-2">No progress photos yet</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Upload your first photo to start tracking your transformation!
            </p>
            <Button onClick={handleUploadPhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
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
                Close
              </Button>
              <span className="font-medium">
                {currentPhotoIndex + 1} of {flatPhotos.length}
              </span>
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
              >
                Delete
              </Button>
            </div>
            
            {/* Photo */}
            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={`Progress photo from ${selectedPhoto.date}`}
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
