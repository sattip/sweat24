import React, { useState, useEffect } from "react";
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
  LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProgressPhotosTab } from "@/components/ProgressPhotosTab";
import { bodyMeasurementService, type BodyMeasurement, type CreateMeasurementRequest } from "@/services/bodyMeasurementService";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";


// Types for measurements - using BodyMeasurement from service
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
  bmi?: string; // Added BMI field
}


const ProgressPage = () => {
  // Measurements state
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load measurements on component mount
  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const data = await bodyMeasurementService.getMeasurements();
      
      // Convert API data to component format
      const convertedMeasurements: Measurement[] = data.map(item => {
        const parsedDate = bodyMeasurementService.parseDateFromAPI(item.date);
        
        return {
          id: item.id ? item.id.toString() : Date.now().toString(),
          date: parsedDate,
          weight: item.weight || "",
          height: item.height || "",
          waist: item.waist || "",
          hips: item.hips || "",
          chest: item.chest || "",
          arm: item.arm || "",
          thigh: item.thigh || "",
          bodyFat: item.bodyFat || "",
          notes: item.notes || "",
          bmi: item.bmi || ""
        };
      });
      
      setMeasurements(convertedMeasurements);
    } catch (error) {
      console.error('Error loading measurements:', error);
      toast.error('Αποτυχία φόρτωσης μετρήσεων');
      setMeasurements([]);
    } finally {
      setLoading(false);
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

  const handleAddMeasurement = async () => {
    try {
      // Client-side validation
      const measurementData: CreateMeasurementRequest = {
        date: bodyMeasurementService.formatDateForAPI(newMeasurement.date || new Date()),
        weight: newMeasurement.weight || undefined,
        height: newMeasurement.height || undefined,
        waist: newMeasurement.waist || undefined,
        hips: newMeasurement.hips || undefined,
        chest: newMeasurement.chest || undefined,
        arm: newMeasurement.arm || undefined,
        thigh: newMeasurement.thigh || undefined,
        bodyFat: newMeasurement.bodyFat || undefined,
        notes: newMeasurement.notes || undefined,
      };

      const errors = bodyMeasurementService.validateMeasurement(measurementData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return;
      }

      const newApiMeasurement = await bodyMeasurementService.createMeasurement(measurementData);
      
      // Check if response contains the expected data
      if (!newApiMeasurement || typeof newApiMeasurement !== 'object') {
        console.error('Invalid API response:', newApiMeasurement);
        toast.error("Η μέτρηση προστέθηκε αλλά χρειάζεται ανανέωση σελίδας");
        
        // Reload measurements from server
        setTimeout(() => {
          loadMeasurements();
        }, 1000);
        
        setShowAddDialog(false);
        return;
      }
      
      // Convert to component format and add to state
      const convertedMeasurement: Measurement = {
        id: newApiMeasurement.id ? newApiMeasurement.id.toString() : Date.now().toString(),
        date: newApiMeasurement.date ? bodyMeasurementService.parseDateFromAPI(newApiMeasurement.date) : newMeasurement.date || new Date(),
        weight: newApiMeasurement.weight || newMeasurement.weight || "",
        height: newApiMeasurement.height || newMeasurement.height || "",
        waist: newApiMeasurement.waist || newMeasurement.waist || "",
        hips: newApiMeasurement.hips || newMeasurement.hips || "",
        chest: newApiMeasurement.chest || newMeasurement.chest || "",
        arm: newApiMeasurement.arm || newMeasurement.arm || "",
        thigh: newApiMeasurement.thigh || newMeasurement.thigh || "",
        bodyFat: newApiMeasurement.bodyFat || newMeasurement.bodyFat || "",
        notes: newApiMeasurement.notes || newMeasurement.notes || "",
        bmi: newApiMeasurement.bmi || ""
      };

      // Add to beginning of array (API returns in descending order)
      setMeasurements([convertedMeasurement, ...measurements]);
      
      // Reset form
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
    } catch (error: any) {
      console.error('Error adding measurement:', error);
      
      // Handle validation errors from backend
      if (error.validationErrors) {
        Object.values(error.validationErrors).flat().forEach((msg: any) => {
          toast.error(msg);
        });
      } else {
        toast.error(error.message || "Αποτυχία προσθήκης μέτρησης");
      }
    }
  };

  const handleEditMeasurement = async () => {
    if (!editingMeasurement) return;
    
    try {
      const measurementData: CreateMeasurementRequest = {
        date: bodyMeasurementService.formatDateForAPI(editingMeasurement.date),
        weight: editingMeasurement.weight || undefined,
        height: editingMeasurement.height || undefined,
        waist: editingMeasurement.waist || undefined,
        hips: editingMeasurement.hips || undefined,
        chest: editingMeasurement.chest || undefined,
        arm: editingMeasurement.arm || undefined,
        thigh: editingMeasurement.thigh || undefined,
        bodyFat: editingMeasurement.bodyFat || undefined,
        notes: editingMeasurement.notes || undefined,
      };

      const errors = bodyMeasurementService.validateMeasurement(measurementData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return;
      }

      const updatedApiMeasurement = await bodyMeasurementService.updateMeasurement(
        parseInt(editingMeasurement.id), 
        measurementData
      );
      
      // Convert to component format and update state
      const convertedMeasurement: Measurement = {
        id: updatedApiMeasurement.id ? updatedApiMeasurement.id.toString() : editingMeasurement.id,
        date: bodyMeasurementService.parseDateFromAPI(updatedApiMeasurement.date),
        weight: updatedApiMeasurement.weight || "",
        height: updatedApiMeasurement.height || "",
        waist: updatedApiMeasurement.waist || "",
        hips: updatedApiMeasurement.hips || "",
        chest: updatedApiMeasurement.chest || "",
        arm: updatedApiMeasurement.arm || "",
        thigh: updatedApiMeasurement.thigh || "",
        bodyFat: updatedApiMeasurement.bodyFat || "",
        notes: updatedApiMeasurement.notes || "",
        bmi: updatedApiMeasurement.bmi || ""
      };

      setMeasurements(measurements.map(m => 
        m.id === editingMeasurement.id ? convertedMeasurement : m
      ));
      
      setEditingMeasurement(null);
      setShowEditDialog(false);
      toast.success("Η μέτρηση ενημερώθηκε επιτυχώς!");
    } catch (error: any) {
      console.error('Error updating measurement:', error);
      
      // Handle validation errors from backend
      if (error.validationErrors) {
        Object.values(error.validationErrors).flat().forEach((msg: any) => {
          toast.error(msg);
        });
      } else {
        toast.error(error.message || "Αποτυχία ενημέρωσης μέτρησης");
      }
    }
  };

  const handleDeleteMeasurement = async (id: string) => {
    try {
      await bodyMeasurementService.deleteMeasurement(parseInt(id));
      setMeasurements(measurements.filter(m => m.id !== id));
      toast.success("Η μέτρηση διαγράφηκε επιτυχώς!");
    } catch (error: any) {
      console.error('Error deleting measurement:', error);
      toast.error(error.message || "Αποτυχία διαγραφής μέτρησης");
    }
  };

  const getChartData = (field: keyof Measurement) => {
    // API returns data in descending order, so we reverse for chronological order in charts
    return [...measurements]
      .reverse()
      .filter(m => {
        // Filter out entries with invalid dates or empty field values
        return m[field] && m[field] !== "" && 
               m.date instanceof Date && !isNaN(m.date.getTime());
      })
      .map(m => ({
        date: format(m.date, 'dd/MM'),
        value: parseFloat(m[field] as string) || 0
      }));
  };

  const chartFields = [
    { key: 'weight' as keyof Measurement, label: 'Βάρος (kg)' },
    { key: 'bmi' as keyof Measurement, label: 'ΔΜΣ' },
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
            <ProgressPhotosTab />
          </TabsContent>
          
          <TabsContent value="measurements" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Σωματικές Μετρήσεις</h2>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Προσθήκη Μέτρησης
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Φόρτωση μετρήσεων...</p>
                </div>
              </div>
            ) : measurements.length > 0 ? (
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
                                    Μέτρηση {measurement.date instanceof Date && !isNaN(measurement.date.getTime()) 
                                      ? format(measurement.date, 'dd/MM/yyyy')
                                      : 'Άγνωστη ημερομηνία'}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    Βάρος: {measurement.weight}kg | ΔΜΣ: {measurement.bmi} | Μέση: {measurement.waist}cm | Λίπος: {measurement.bodyFat}%
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
                                {measurement.bmi && (
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">ΔΜΣ</Label>
                                    <p className="font-medium">{measurement.bmi}</p>
                                  </div>
                                )}
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