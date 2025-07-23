import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { FileText, Download, Calendar, Users } from "lucide-react";
import { mockInstructorsData } from "../data/mockData";

interface TrainerReportModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

export function TrainerReportModal({ 
  isOpen, 
  onOpenChange, 
  triggerButton = true 
}: TrainerReportModalProps) {
  const { toast } = useToast();
  const [reportSettings, setReportSettings] = useState({
    reportType: "performance",
    dateFrom: "",
    dateTo: "",
    selectedTrainers: [] as string[],
    includeFinancials: true,
    includeSchedule: true,
    includePerformance: true,
    includeCustomerFeedback: false,
    format: "pdf",
  });

  const handleTrainerSelection = (trainerId: string, checked: boolean) => {
    setReportSettings(prev => ({
      ...prev,
      selectedTrainers: checked 
        ? [...prev.selectedTrainers, trainerId]
        : prev.selectedTrainers.filter(id => id !== trainerId)
    }));
  };

  const selectAllTrainers = () => {
    setReportSettings(prev => ({
      ...prev,
      selectedTrainers: mockInstructorsData.map(t => t.id)
    }));
  };

  const clearAllTrainers = () => {
    setReportSettings(prev => ({
      ...prev,
      selectedTrainers: []
    }));
  };

  const handleGenerateReport = () => {
    if (!reportSettings.dateFrom || !reportSettings.dateTo) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε εύρος ημερομηνιών.",
        variant: "destructive"
      });
      return;
    }

    if (reportSettings.selectedTrainers.length === 0) {
      toast({
        title: "Σφάλμα", 
        description: "Παρακαλώ επιλέξτε τουλάχιστον έναν προπονητή.",
        variant: "destructive"
      });
      return;
    }

    // Προσομοίωση δημιουργίας αναφοράς
    const selectedTrainerNames = mockInstructorsData
      .filter(t => reportSettings.selectedTrainers.includes(t.id))
      .map(t => t.name);

    toast({
      title: "Αναφορά Δημιουργήθηκε! 📊",
      description: `Η αναφορά για ${selectedTrainerNames.length} προπονητή(ές) δημιουργήθηκε επιτυχώς και θα κατέβει σύντομα.`,
      duration: 5000
    });

    // Προσομοίωση download
    setTimeout(() => {
      const filename = `trainer_report_${reportSettings.dateFrom}_to_${reportSettings.dateTo}.${reportSettings.format}`;
      toast({
        title: "Λήψη Ξεκίνησε! 📥",
        description: `Το αρχείο ${filename} ξεκίνησε να κατεβαίνει.`,
      });
    }, 2000);

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const getReportDescription = () => {
    switch (reportSettings.reportType) {
      case "performance":
        return "Απόδοση, συνεδρίες, και αξιολογήσεις προπονητών";
      case "financial":
        return "Οικονομικά στοιχεία, αμοιβές, και προμήθειες";
      case "schedule":
        return "Πρόγραμμα, διαθεσιμότητα, και ώρες εργασίας";
      case "comprehensive":
        return "Πλήρης αναφορά με όλα τα στοιχεία";
      default:
        return "";
    }
  };

  const content = (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Εξαγωγή Αναφοράς Προπονητών
        </DialogTitle>
        <DialogDescription>
          Δημιουργήστε λεπτομερείς αναφορές για τους προπονητές σας
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6">
        {/* Τύπος Αναφοράς */}
        <div>
          <Label>Τύπος Αναφοράς</Label>
          <Select 
            value={reportSettings.reportType} 
            onValueChange={(value) => setReportSettings(prev => ({...prev, reportType: value}))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">📈 Αναφορά Απόδοσης</SelectItem>
              <SelectItem value="financial">💰 Οικονομική Αναφορά</SelectItem>
              <SelectItem value="schedule">📅 Αναφορά Προγράμματος</SelectItem>
              <SelectItem value="comprehensive">📋 Συνολική Αναφορά</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {getReportDescription()}
          </p>
        </div>

        {/* Εύρος Ημερομηνιών */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateFrom">Από</Label>
            <Input
              id="dateFrom"
              type="date"
              value={reportSettings.dateFrom}
              onChange={(e) => setReportSettings(prev => ({...prev, dateFrom: e.target.value}))}
            />
          </div>
          <div>
            <Label htmlFor="dateTo">Έως</Label>
            <Input
              id="dateTo"
              type="date"
              value={reportSettings.dateTo}
              onChange={(e) => setReportSettings(prev => ({...prev, dateTo: e.target.value}))}
            />
          </div>
        </div>

        {/* Επιλογή Προπονητών */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Προπονητές</Label>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllTrainers}>
                Επιλογή Όλων
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllTrainers}>
                Καθαρισμός
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="grid gap-3">
              {mockInstructorsData.map((trainer) => (
                <div key={trainer.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={trainer.id}
                    checked={reportSettings.selectedTrainers.includes(trainer.id)}
                    onCheckedChange={(checked) => handleTrainerSelection(trainer.id, checked as boolean)}
                  />
                  <Label htmlFor={trainer.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>{trainer.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {trainer.specialties.slice(0, 2).join(", ")}
                        {trainer.specialties.length > 2 && "..."}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            Επιλεγμένοι: {reportSettings.selectedTrainers.length} από {mockInstructorsData.length}
          </p>
        </div>

        {/* Περιεχόμενα Αναφοράς */}
        <div>
          <Label className="text-base font-medium">Περιεχόμενα Αναφοράς</Label>
          <div className="grid gap-3 mt-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFinancials"
                checked={reportSettings.includeFinancials}
                onCheckedChange={(checked) => setReportSettings(prev => ({...prev, includeFinancials: checked as boolean}))}
              />
              <Label htmlFor="includeFinancials">💰 Οικονομικά Στοιχεία</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSchedule"
                checked={reportSettings.includeSchedule}
                onCheckedChange={(checked) => setReportSettings(prev => ({...prev, includeSchedule: checked as boolean}))}
              />
              <Label htmlFor="includeSchedule">📅 Πρόγραμμα & Διαθεσιμότητα</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePerformance"
                checked={reportSettings.includePerformance}
                onCheckedChange={(checked) => setReportSettings(prev => ({...prev, includePerformance: checked as boolean}))}
              />
              <Label htmlFor="includePerformance">📈 Δείκτες Απόδοσης</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCustomerFeedback"
                checked={reportSettings.includeCustomerFeedback}
                onCheckedChange={(checked) => setReportSettings(prev => ({...prev, includeCustomerFeedback: checked as boolean}))}
              />
              <Label htmlFor="includeCustomerFeedback">⭐ Αξιολογήσεις Πελατών</Label>
            </div>
          </div>
        </div>

        {/* Μορφή Αρχείου */}
        <div>
          <Label>Μορφή Αρχείου</Label>
          <Select 
            value={reportSettings.format} 
            onValueChange={(value) => setReportSettings(prev => ({...prev, format: value}))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">📄 PDF</SelectItem>
              <SelectItem value="excel">📊 Excel</SelectItem>
              <SelectItem value="csv">📋 CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Κουμπί Δημιουργίας */}
        <Button onClick={handleGenerateReport} className="w-full" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Δημιουργία & Κατέβασμα Αναφοράς
        </Button>
      </div>
    </DialogContent>
  );

  if (triggerButton) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Εξαγωγή Αναφοράς
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
} 