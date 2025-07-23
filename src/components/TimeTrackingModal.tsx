import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Plus, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockWorkTimeEntries, mockInstructorsData } from "@/data/mockData";
import type { WorkTimeEntry, Instructor } from "@/data/mockData";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface TimeTrackingModalProps {
  instructorId?: string;
}

export function TimeTrackingModal({ instructorId }: TimeTrackingModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<WorkTimeEntry[]>(mockWorkTimeEntries);
  const [formData, setFormData] = useState({
    instructorId: instructorId || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    description: ''
  });

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startTime = new Date(`2000-01-01 ${start}`);
    const endTime = new Date(`2000-01-01 ${end}`);
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  };

  const hoursWorked = calculateHours(formData.startTime, formData.endTime);

  const handleSubmit = () => {
    if (!formData.instructorId || !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.",
        variant: "destructive"
      });
      return;
    }

    if (hoursWorked <= 0) {
      toast({
        title: "Σφάλμα",
        description: "Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.",
        variant: "destructive"
      });
      return;
    }

    const instructor = mockInstructorsData.find(i => i.id === formData.instructorId);
    if (!instructor) return;

    const newEntry: WorkTimeEntry = {
      id: `wte_${Date.now()}`,
      instructorId: formData.instructorId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      hoursWorked: hoursWorked,
      description: formData.description,
      approved: false
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    
    toast({
      title: "Επιτυχής Καταχώρηση",
      description: `Καταχωρήθηκαν ${hoursWorked.toFixed(1)} ώρες για τον ${instructor.name}.`
    });

    // Reset form
    setFormData({
      instructorId: instructorId || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      description: ''
    });
    
    setIsOpen(false);
  };

  const handleApproval = (entryId: string, approved: boolean) => {
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            approved, 
            approvedBy: approved ? "Διαχειριστής" : undefined,
            approvedAt: approved ? new Date().toISOString() : undefined
          }
        : entry
    ));

    toast({
      title: approved ? "Ώρες Εγκρίθηκαν" : "Ώρες Απορρίφθηκαν",
      description: `Οι ώρες εργασίας ${approved ? 'εγκρίθηκαν' : 'απορρίφθηκαν'}.`
    });
  };

  const filteredEntries = instructorId 
    ? timeEntries.filter(entry => entry.instructorId === instructorId)
    : timeEntries;

  const getInstructorName = (id: string) => {
    const instructor = mockInstructorsData.find(i => i.id === id);
    return instructor?.name || 'Άγνωστος';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Ωρομέτρηση
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Διαχείριση Ωρομέτρησης</DialogTitle>
          <DialogDescription>
            Καταχώρηση και έγκριση ωρών εργασίας προπονητών
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Form για νέα καταχώρηση */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Νέα Καταχώρηση Ωρών</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {!instructorId && (
                  <div>
                    <Label>Προπονητής</Label>
                    <Select value={formData.instructorId} onValueChange={(value) => setFormData(prev => ({...prev, instructorId: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλογή προπονητή" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockInstructorsData.map(instructor => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Ημερομηνία</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ώρα Έναρξης</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({...prev, startTime: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Ώρα Λήξης</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({...prev, endTime: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Συνολικές Ώρες</Label>
                  <Input value={hoursWorked.toFixed(1)} readOnly className="bg-muted" />
                </div>
              </div>
              <div>
                <Label>Περιγραφή Εργασίας</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Περιγράψτε τις εργασίες που εκτελέστηκαν..."
                  rows={2}
                />
              </div>
              <Button onClick={handleSubmit} className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Καταχώρηση Ωρών
              </Button>
            </div>
          </div>

          {/* Πίνακας υπαρχουσών καταχωρήσεων */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Καταχωρήσεις Ωρών</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {!instructorId && <TableHead>Προπονητής</TableHead>}
                  <TableHead>Ημερομηνία</TableHead>
                  <TableHead>Ώρες</TableHead>
                  <TableHead>Συνολικές Ώρες</TableHead>
                  <TableHead>Περιγραφή</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.slice(0, 10).map((entry) => (
                  <TableRow key={entry.id}>
                    {!instructorId && (
                      <TableCell className="font-medium">
                        {getInstructorName(entry.instructorId)}
                      </TableCell>
                    )}
                    <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: el })}</TableCell>
                    <TableCell>{entry.startTime} - {entry.endTime}</TableCell>
                    <TableCell>{entry.hoursWorked.toFixed(1)}h</TableCell>
                    <TableCell className="max-w-48 truncate">{entry.description}</TableCell>
                    <TableCell>
                      {entry.approved ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Εγκεκριμένες
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Εκκρεμείς</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!entry.approved && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApproval(entry.id, true)}
                            title="Έγκριση"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApproval(entry.id, false)}
                            title="Απόρριψη"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 