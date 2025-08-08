import React, { useRef, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  Trash2, 
  LineChart,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Info 
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Camera as DeviceCamera } from "@capacitor/camera";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Types for progress photos
interface ProgressPhoto {
  id: number;
  imageUrl: string;
  date: string;
  caption?: string;
}

// Types for measurements
interface Measurement {
  id: string;
  date: Date;
  weight: string;
  height: string;
  waist: string;
  hips: string;
  chest: string;
  arm: string;
  thigh: string;
  bodyFat: string;
  notes: string;
}

// Mock data for progress photos
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

// Sample data for measurements
const sampleMeasurements: Measurement[] = [
  {
    id: "1",
    date: new Date(2024, 4, 10),
    weight: "75",
    height: "175",
    waist: "80",
    hips: "95",
    chest: "100",
    arm: "35",
    thigh: "55",
    bodyFat: "18",
    notes: "Ξεκινώ το ταξίδι φυσικής κατάστασής μου"
  },
  {
    id: "2",
    date: new Date(2024, 4, 17),
    weight: "74",
    height: "175",
    waist: "79",
    hips: "94",
    chest: "100",
    arm: "35.5",
    thigh: "54.5",
    bodyFat: "17.5",
    notes: "Μια εβδομάδα μετά, αισθάνομαι καλά"
  },
  {
    id: "3",
    date: new Date(2024, 4, 24),
    weight: "73",
    height: "175",
    waist: "78",
    hips: "93",
    chest: "101",
    arm: "36",
    thigh: "54",
    bodyFat: "17",
    notes: "Αρχίζω να βλέπω αλλαγές"
  }
];

// Group photos by month
interface GroupedPhotos {
  [monthYear: string]: ProgressPhoto[];
}

const groupPhotosByMonth = (photos: ProgressPhoto[]): GroupedPhotos => {
  const grouped: GroupedPhotos = {};
  
  photos.forEach(photo => {
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

const ProgressPage = () => {
  // Photos state
  const [photoSortOrder, setPhotoSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [showPhotosEmptyState, setShowPhotosEmptyState] = useState<boolean>(false);
  const [showPhotoTips, setShowPhotoTips] = useState<boolean>(false);
  
  // Measurements state
  const [measurements, setMeasurements] = useState<Measurement[]>(sampleMeasurements);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({
    date: new Date(),
    weight: "",
    height: "",
    waist: "",
    hips: "",
    chest: "",
    arm: "",
    thigh: "",
    bodyFat: "",
    notes: "",
  });

  // Photos logic
  const hasPhotos = !showPhotosEmptyState && mockProgressPhotos.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`Επιλέχθηκαν ${files.length} φωτογραφίες`);
    // TODO: Θα σταλούν στο backend αποθήκευσης όταν υλοποιηθεί το API
    e.currentTarget.value = ""; // reset για επόμενη επιλογή
  };
  
  const sortedPhotos = [...mockProgressPhotos].sort((a, b) => {
    return photoSortOrder === "newest" ? b.id - a.id : a.id - b.id;
  });
  
  const groupedPhotos = groupPhotosByMonth(sortedPhotos);
  const flatPhotos = sortedPhotos;
  
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
    toast.success("Η φωτογραφία διαγράφηκε επιτυχώς");
    setSelectedPhoto(null);
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
    } catch (err) {
      // συνήθως ακύρωση επιλογής
    }
  };

  // Measurements logic
  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const handleAddMeasurement = () => {
    const measurement: Measurement = {
      ...newMeasurement,
      id: Date.now().toString(),
      date: newMeasurement.date || new Date(),
    } as Measurement;
    
    setMeasurements([...measurements, measurement]);
    setNewMeasurement({
      date: new Date(),
      weight: "",
      height: "",
      waist: "",
      hips: "",
      chest: "",
      arm: "",
      thigh: "",
      bodyFat: "",
      notes: "",
    });
    setShowAddDialog(false);
    toast.success("Η μέτρηση προστέθηκε επιτυχώς!");
  };

  const handleEditMeasurement = () => {
    if (!editingMeasurement) return;
    
    setMeasurements(measurements.map(m => 
      m.id === editingMeasurement.id ? editingMeasurement : m
    ));
    setEditingMeasurement(null);
    setShowEditDialog(false);
    toast.success("Η μέτρηση ενημερώθηκε επιτυχώς!");
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
    toast.success("Η μέτρηση διαγράφηκε επιτυχώς!");
  };

  const getChartData = (field: keyof Measurement) => {
    return measurements
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(m => ({
        date: format(m.date, 'dd/MM'),
        value: parseFloat(m[field] as string) || 0
      }));
  };

  const chartFields = [
    { key: 'weight' as keyof Measurement, label: 'Βάρος (kg)' },
    { key: 'waist' as keyof Measurement, label: 'Μέση (cm)' },
    { key: 'hips' as keyof Measurement, label: 'Γοφοί (cm)' },
    { key: 'chest' as keyof Measurement, label: 'Στήθος (cm)' },
    { key: 'arm' as keyof Measurement, label: 'Μπράτσο (cm)' },
    { key: 'thigh' as keyof Measurement, label: 'Μηρός (cm)' },
    { key: 'bodyFat' as keyof Measurement, label: 'Λίπος (%)' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Έλεγχος Προόδου</h1>
          <p className="text-muted-foreground mt-2">
            Παρακολουθήστε την πρόοδό σας μέσω φωτογραφιών και μετρήσεων
          </p>
        </div>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photos">Φωτογραφίες Προόδου</TabsTrigger>
            <TabsTrigger value="measurements">Σωματικές Μετρήσεις</TabsTrigger>
          </TabsList>
          
          <TabsContent value="photos" className="mt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold">Φωτογραφίες Προόδου</h2>
              
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPhotoTips(!showPhotoTips)}
                  title="Συμβουλές Φωτογραφίας"
                >
                  <Info className="h-4 w-4" />
                </Button>
                
                <Select value={photoSortOrder} onValueChange={(value) => {
                  if (value === "empty") {
                    setShowPhotosEmptyState(true);
                  } else {
                    setShowPhotosEmptyState(false);
                    setPhotoSortOrder(value as "newest" | "oldest");
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

            {hasPhotos ? (
              <div className="space-y-8">
                {Object.entries(groupedPhotos).map(([monthYear, photos]) => (
                  <div key={monthYear}>
                    <h3 className="text-lg font-semibold mb-4 text-muted-foreground">{monthYear}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map((photo) => (
                        <Card 
                          key={photo.id} 
                          className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                          onClick={() => handlePhotoClick(photo)}
                        >
                          <div className="aspect-square relative">
                            <img 
                              src={photo.imageUrl} 
                              alt={`Πρόοδος ${photo.date}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground mb-1">{photo.date}</p>
                            {photo.caption && (
                              <p className="text-xs line-clamp-2">{photo.caption}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/40 rounded-full p-6 mb-4">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Δεν υπάρχουν φωτογραφίες προόδου</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Αρχίστε να καταγράφετε την πρόοδό σας με φωτογραφίες. Είναι ο καλύτερος τρόπος να παρακολουθήσετε τις αλλαγές στο σώμα σας.
                </p>
                <Button onClick={handleUploadPhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Προσθήκη Πρώτης Φωτογραφίας
                </Button>
              </div>
            )}

            {/* Tips Dialog */}
            {showPhotoTips && (
              <Dialog open={showPhotoTips} onOpenChange={setShowPhotoTips}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Συμβουλές για Φωτογραφίες Προόδου</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">📸 Συνέπεια στη Λήψη</h4>
                      <p className="text-sm text-muted-foreground">Τραβήξτε φωτογραφίες την ίδια ώρα της ημέρας, κατά προτίμηση το πρωί πριν φάτε.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">💡 Φωτισμός</h4>
                      <p className="text-sm text-muted-foreground">Χρησιμοποιήστε φυσικό φως κοντά σε παράθυρο ή σταθερό τεχνητό φωτισμό.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">🏃‍♂️ Πόζες</h4>
                      <p className="text-sm text-muted-foreground">Μπροστινή, πλάγια και πίσω όψη με φυσικό στάσιμο και χαλαρούς ώμους.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">👕 Ρουχισμός</h4>
                      <p className="text-sm text-muted-foreground">Φοράτε πάντα τα ίδια ή παρόμοια ρούχα για καλύτερη σύγκριση.</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setShowPhotoTips(false)}>Κατάλαβα</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Full Screen Photo Dialog */}
            {selectedPhoto && (
              <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                  <div className="relative">
                    <img 
                      src={selectedPhoto.imageUrl} 
                      alt={`Πρόοδος ${selectedPhoto.date}`}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary"
                        onClick={() => handleDeletePhoto(selectedPhoto.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary"
                        onClick={() => setSelectedPhoto(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Navigation arrows */}
                    {currentPhotoIndex > 0 && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        onClick={handlePreviousPhoto}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {currentPhotoIndex < flatPhotos.length - 1 && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        onClick={handleNextPhoto}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{selectedPhoto.date}</p>
                      <Badge variant="outline">{currentPhotoIndex + 1} από {flatPhotos.length}</Badge>
                    </div>
                    {selectedPhoto.caption && (
                      <p className="text-sm">{selectedPhoto.caption}</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
          
          <TabsContent value="measurements" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Σωματικές Μετρήσεις</h2>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Προσθήκη Μέτρησης
              </Button>
            </div>

            {measurements.length > 0 ? (
              <>
                {/* Charts Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Γραφήματα Προόδου</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                    {chartFields.map((field) => (
                      <Button
                        key={field.key}
                        variant={activeChart === field.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveChart(activeChart === field.key ? null : field.key)}
                        className="text-xs"
                      >
                        <LineChart className="h-3 w-3 mr-1" />
                        {field.label}
                      </Button>
                    ))}
                  </div>
                  
                  {activeChart && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {chartFields.find(f => f.key === activeChart)?.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={getChartData(activeChart)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                dot={{ fill: "hsl(var(--primary))" }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Measurements List */}
                <div className="space-y-4">
                  {measurements
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((measurement) => (
                      <Card key={measurement.id}>
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    Μέτρηση {format(measurement.date, 'dd/MM/yyyy')}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    Βάρος: {measurement.weight}kg | Μέση: {measurement.waist}cm | Λίπος: {measurement.bodyFat}%
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingMeasurement(measurement);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMeasurement(measurement.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  {expandedCards.has(measurement.id) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Ύψος</Label>
                                  <p className="font-medium">{measurement.height} cm</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Γοφοί</Label>
                                  <p className="font-medium">{measurement.hips} cm</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Στήθος</Label>
                                  <p className="font-medium">{measurement.chest} cm</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Μπράτσο</Label>
                                  <p className="font-medium">{measurement.arm} cm</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Μηρός</Label>
                                  <p className="font-medium">{measurement.thigh} cm</p>
                                </div>
                              </div>
                              {measurement.notes && (
                                <div className="mt-4">
                                  <Label className="text-xs font-medium text-muted-foreground">Σημειώσεις</Label>
                                  <p className="text-sm mt-1">{measurement.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/40 rounded-full p-6 mb-4">
                  <LineChart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Δεν υπάρχουν μετρήσεις</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Αρχίστε να καταγράφετε τις σωματικές σας μετρήσεις για να παρακολουθήσετε την πρόοδό σας με ακρίβεια.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Προσθήκη Πρώτης Μέτρησης
                </Button>
              </div>
            )}

            {/* Add Measurement Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Προσθήκη Νέας Μέτρησης</DialogTitle>
                  <DialogDescription>
                    Καταγράψτε τις τρέχουσες σωματικές σας μετρήσεις
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Ημερομηνία</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            {newMeasurement.date ? format(newMeasurement.date, 'dd/MM/yyyy') : "Επιλέξτε ημερομηνία"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newMeasurement.date}
                            onSelect={(date) => setNewMeasurement({...newMeasurement, date: date || new Date()})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Βάρος (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={newMeasurement.weight}
                          onChange={(e) => setNewMeasurement({...newMeasurement, weight: e.target.value})}
                          placeholder="75.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Ύψος (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={newMeasurement.height}
                          onChange={(e) => setNewMeasurement({...newMeasurement, height: e.target.value})}
                          placeholder="175"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="waist">Μέση (cm)</Label>
                        <Input
                          id="waist"
                          type="number"
                          step="0.1"
                          value={newMeasurement.waist}
                          onChange={(e) => setNewMeasurement({...newMeasurement, waist: e.target.value})}
                          placeholder="80.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hips">Γοφοί (cm)</Label>
                        <Input
                          id="hips"
                          type="number"
                          step="0.1"
                          value={newMeasurement.hips}
                          onChange={(e) => setNewMeasurement({...newMeasurement, hips: e.target.value})}
                          placeholder="95.0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="chest">Στήθος (cm)</Label>
                        <Input
                          id="chest"
                          type="number"
                          step="0.1"
                          value={newMeasurement.chest}
                          onChange={(e) => setNewMeasurement({...newMeasurement, chest: e.target.value})}
                          placeholder="100.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="arm">Μπράτσο (cm)</Label>
                        <Input
                          id="arm"
                          type="number"
                          step="0.1"
                          value={newMeasurement.arm}
                          onChange={(e) => setNewMeasurement({...newMeasurement, arm: e.target.value})}
                          placeholder="35.0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="thigh">Μηρός (cm)</Label>
                        <Input
                          id="thigh"
                          type="number"
                          step="0.1"
                          value={newMeasurement.thigh}
                          onChange={(e) => setNewMeasurement({...newMeasurement, thigh: e.target.value})}
                          placeholder="55.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bodyFat">Σωματικό Λίπος (%)</Label>
                        <Input
                          id="bodyFat"
                          type="number"
                          step="0.1"
                          value={newMeasurement.bodyFat}
                          onChange={(e) => setNewMeasurement({...newMeasurement, bodyFat: e.target.value})}
                          placeholder="18.0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Σημειώσεις</Label>
                      <Textarea
                        id="notes"
                        value={newMeasurement.notes}
                        onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
                        placeholder="Προαιρετικές σημειώσεις..."
                        rows={3}
                      />
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Ακύρωση
                  </Button>
                  <Button onClick={handleAddMeasurement}>
                    Προσθήκη Μέτρησης
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Measurement Dialog */}
            {editingMeasurement && (
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Επεξεργασία Μέτρησης</DialogTitle>
                    <DialogDescription>
                      Επεξεργαστείτε τις σωματικές σας μετρήσεις
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] pr-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-date">Ημερομηνία</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              {editingMeasurement.date ? format(editingMeasurement.date, 'dd/MM/yyyy') : "Επιλέξτε ημερομηνία"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editingMeasurement.date}
                              onSelect={(date) => setEditingMeasurement({...editingMeasurement, date: date || new Date()})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-weight">Βάρος (kg)</Label>
                          <Input
                            id="edit-weight"
                            type="number"
                            step="0.1"
                            value={editingMeasurement.weight}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, weight: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-height">Ύψος (cm)</Label>
                          <Input
                            id="edit-height"
                            type="number"
                            value={editingMeasurement.height}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, height: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-waist">Μέση (cm)</Label>
                          <Input
                            id="edit-waist"
                            type="number"
                            step="0.1"
                            value={editingMeasurement.waist}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, waist: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-hips">Γοφοί (cm)</Label>
                          <Input
                            id="edit-hips"
                            type="number"
                            step="0.1"
                            value={editingMeasurement.hips}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, hips: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-chest">Στήθος (cm)</Label>
                          <Input
                            id="edit-chest"
                            type="number"
                            step="0.1"
                            value={editingMeasurement.chest}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, chest: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-arm">Μπράτσο (cm)</Label>
                          <Input
                            id="edit-arm"
                            type="number"
                            step="0.1"
                            value={editingMeasurement.arm}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, arm: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-thigh">Μηρός (cm)</Label>
                          <Input
                            id="edit-thigh"
                            type="number"
                            step="0.1"
                            value={editingMeasurement.thigh}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, thigh: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-bodyFat">Σωματικό Λίπος (%)</Label>
                          <Input
                            id="edit-bodyFat"
                            type="number"
                            step="0.1"
                            value={editingMeasurement.bodyFat}
                            onChange={(e) => setEditingMeasurement({...editingMeasurement, bodyFat: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-notes">Σημειώσεις</Label>
                        <Textarea
                          id="edit-notes"
                          value={editingMeasurement.notes}
                          onChange={(e) => setEditingMeasurement({...editingMeasurement, notes: e.target.value})}
                          rows={3}
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleEditMeasurement}>
                      Ενημέρωση Μέτρησης
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProgressPage; 