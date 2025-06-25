
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  Trash2, 
  LineChart 
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Define types for our measurements
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

// Sample data for demonstration
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
    notes: "Δύο εβδομάδες μετά, βλέπω πρόοδο"
  }
];

const BodyMeasurementsPage: React.FC = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>(sampleMeasurements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [expandedMeasurement, setExpandedMeasurement] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Measurement, 'id'>>({
    date: new Date(),
    weight: "",
    height: "",
    waist: "",
    hips: "",
    chest: "",
    arm: "",
    thigh: "",
    bodyFat: "",
    notes: ""
  });
  const [showChart, setShowChart] = useState(false);
  const [chartMetric, setChartMetric] = useState<string>("weight");

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      setDatePickerOpen(false);
    }
  };

  // Toggle measurement details
  const toggleMeasurement = (id: string) => {
    setExpandedMeasurement(prev => prev === id ? null : id);
  };

  // Handle saving new measurement
  const handleSaveMeasurement = () => {
    if (selectedMeasurement) {
      // Edit existing measurement
      setMeasurements(prev => 
        prev.map(m => m.id === selectedMeasurement.id ? { ...formData, id: selectedMeasurement.id } : m)
      );
    } else {
      // Add new measurement
      const newMeasurement: Measurement = {
        ...formData,
        id: Date.now().toString()
      };
      setMeasurements(prev => [...prev, newMeasurement]);
    }
    handleCloseDialog();
  };

  // Open dialog for new measurement
  const handleAddNew = () => {
    setSelectedMeasurement(null);
    setFormData({
      date: new Date(),
      weight: "",
      height: "",
      waist: "",
      hips: "",
      chest: "",
      arm: "",
      thigh: "",
      bodyFat: "",
      notes: ""
    });
    setDialogOpen(true);
  };

  // Open dialog for editing
  const handleEdit = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setFormData({
      date: measurement.date,
      weight: measurement.weight,
      height: measurement.height,
      waist: measurement.waist,
      hips: measurement.hips,
      chest: measurement.chest,
      arm: measurement.arm,
      thigh: measurement.thigh,
      bodyFat: measurement.bodyFat,
      notes: measurement.notes
    });
    setDialogOpen(true);
  };

  // Delete measurement
  const handleDelete = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMeasurement(null);
  };

  // Get chart data
  const getChartData = () => {
    return measurements
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(m => ({
        date: format(m.date, 'MM/dd'),
        [chartMetric]: parseFloat(m[chartMetric as keyof Measurement] as string) || 0
      }));
  };

  return (
    <>
      <Header />
      <main className="container max-w-4xl mx-auto p-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Μετρήσεις Σώματος</h1>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus size={18} />
            Προσθήκη Μετρήσεων
          </Button>
        </div>

        {measurements.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-muted-foreground">
              Δεν έχουν καταγραφεί μετρήσεις ακόμη. Ξεκινήστε να παρακολουθείτε την πρόοδό σας!
            </div>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus size={18} />
              Προσθήκη Μετρήσεων
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Γράφημα Προόδου</h2>
                <Button 
                  variant={showChart ? "default" : "outline"} 
                  onClick={() => setShowChart(!showChart)} 
                  className="gap-2"
                >
                  <LineChart size={18} />
                  {showChart ? "Απόκρυψη Γραφήματος" : "Εμφάνιση Γραφήματος"}
                </Button>
              </div>
              
              {showChart && (
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <Label>Επιλέξτε μετρικό για εμφάνιση:</Label>
                      <select 
                        className="w-full p-2 border rounded mt-1"
                        value={chartMetric}
                        onChange={(e) => setChartMetric(e.target.value)}
                      >
                        <option value="weight">Βάρος</option>
                        <option value="waist">Μέση</option>
                        <option value="hips">Γοφοί</option>
                        <option value="chest">Στήθος</option>
                        <option value="arm">Μπράτσο</option>
                        <option value="thigh">Μηρός</option>
                        <option value="bodyFat">Ποσοστό Λίπους %</option>
                      </select>
                    </div>
                    
                    <div className="h-[300px] w-full">
                      <ChartContainer
                        className="h-full"
                        config={{
                          metric: {
                            label: "Μέτρηση",
                            color: "#0369a1"
                          }
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={getChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line 
                              type="monotone" 
                              dataKey={chartMetric} 
                              stroke="var(--color-metric)" 
                              activeDot={{ r: 8 }} 
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-2">Ιστορικό Μετρήσεων</h2>
            <div className="space-y-3">
              {measurements
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((measurement) => (
                  <Card key={measurement.id} className="overflow-hidden">
                    <Collapsible 
                      open={expandedMeasurement === measurement.id} 
                      onOpenChange={() => toggleMeasurement(measurement.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="p-4 cursor-pointer hover:bg-gray-50 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{format(measurement.date, 'MMMM d, yyyy')}</CardTitle>
                            <p className="text-muted-foreground text-sm mt-1">
                              Βάρος: {measurement.weight} kg • Μέση: {measurement.waist} cm
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(measurement);
                              }}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(measurement.id);
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                            {expandedMeasurement === measurement.id ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Βάρος</h4>
                            <p>{measurement.weight} kg</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ύψος</h4>
                            <p>{measurement.height} cm</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Μέση</h4>
                            <p>{measurement.waist} cm</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Γοφοί</h4>
                            <p>{measurement.hips} cm</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Στήθος</h4>
                            <p>{measurement.chest} cm</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Μπράτσο (Δεξί)</h4>
                            <p>{measurement.arm} cm</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Μηρός (Δεξί)</h4>
                            <p>{measurement.thigh} cm</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Ποσοστό Λίπους</h4>
                            <p>{measurement.bodyFat}%</p>
                          </div>
                          {measurement.notes && (
                            <div className="col-span-2 md:col-span-3">
                              <h4 className="text-sm font-medium text-muted-foreground">Σημειώσεις</h4>
                              <p className="text-sm">{measurement.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
            </div>
          </>
        )}

        {/* Dialog for Adding/Editing Measurements */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedMeasurement ? "Επεξεργασία Μετρήσεων" : "Προσθήκη Νέων Μετρήσεων"}
              </DialogTitle>
              <DialogDescription>
                Καταγράψτε τις μετρήσεις του σώματός σας για να παρακολουθείτε την πρόοδό σας με την πάροδο του χρόνου.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">Ημερομηνία</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="justify-start text-left font-normal"
                      >
                        {formData.date ? format(formData.date, 'MMMM d, yyyy') : "Επιλέξτε ημερομηνία"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={handleDateSelect}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="weight">Βάρος (kg)</Label>
                  <Input 
                    id="weight" 
                    name="weight" 
                    type="number" 
                    value={formData.weight} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 70" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="height">Ύψος (cm)</Label>
                  <Input 
                    id="height" 
                    name="height" 
                    type="number" 
                    value={formData.height} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 175" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="waist">Μέση (cm)</Label>
                  <Input 
                    id="waist" 
                    name="waist" 
                    type="number" 
                    value={formData.waist} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 80" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="hips">Γοφοί (cm)</Label>
                  <Input 
                    id="hips" 
                    name="hips" 
                    type="number" 
                    value={formData.hips} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 95" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="chest">Στήθος (cm)</Label>
                  <Input 
                    id="chest" 
                    name="chest" 
                    type="number" 
                    value={formData.chest} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 100" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="arm">Μπράτσο - Δεξιός Δικέφαλος (cm)</Label>
                  <Input 
                    id="arm" 
                    name="arm" 
                    type="number" 
                    value={formData.arm} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 35" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="thigh">Μηρός - Δεξιός (cm)</Label>
                  <Input 
                    id="thigh" 
                    name="thigh" 
                    type="number" 
                    value={formData.thigh} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 55" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bodyFat">Ποσοστό Σωματικού Λίπους (%)</Label>
                  <Input 
                    id="bodyFat" 
                    name="bodyFat" 
                    type="number" 
                    value={formData.bodyFat} 
                    onChange={handleInputChange}
                    placeholder="π.χ., 18" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Σημειώσεις</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange}
                    placeholder="Οποιεσδήποτε επιπλέον σημειώσεις για τις μετρήσεις σας..." 
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Ακύρωση</Button>
              <Button onClick={handleSaveMeasurement}>Αποθήκευση</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default BodyMeasurementsPage;
