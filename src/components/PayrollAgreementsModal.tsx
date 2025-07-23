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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockPayrollAgreements, mockInstructorsData } from "@/data/mockData";
import type { PayrollAgreement, Instructor } from "@/data/mockData";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface PayrollAgreementsModalProps {
  instructorId?: string;
}

export function PayrollAgreementsModal({ instructorId }: PayrollAgreementsModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [agreements, setAgreements] = useState<PayrollAgreement[]>(mockPayrollAgreements);
  const [editingAgreement, setEditingAgreement] = useState<PayrollAgreement | null>(null);
  const [formData, setFormData] = useState({
    instructorId: instructorId || '',
    description: '',
    type: 'bonus' as 'bonus' | 'deduction' | 'special_rate',
    amount: '',
    isRecurring: true,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: ''
  });

  const filteredAgreements = instructorId 
    ? agreements.filter(agreement => agreement.instructorId === instructorId)
    : agreements;

  const getInstructorName = (id: string) => {
    const instructor = mockInstructorsData.find(i => i.id === id);
    return instructor?.name || 'Άγνωστος';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bonus': return 'Bonus';
      case 'deduction': return 'Αφαίρεση';
      case 'special_rate': return 'Ειδική Τιμή';
      default: return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bonus':
        return <Badge variant="default" className="bg-green-100 text-green-800">Bonus</Badge>;
      case 'deduction':
        return <Badge variant="destructive">Αφαίρεση</Badge>;
      case 'special_rate':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ειδική Τιμή</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const resetForm = () => {
    setFormData({
      instructorId: instructorId || '',
      description: '',
      type: 'bonus',
      amount: '',
      isRecurring: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: ''
    });
    setEditingAgreement(null);
  };

  const handleSubmit = () => {
    if (!formData.instructorId || !formData.description || !formData.amount) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.",
        variant: "destructive"
      });
      return;
    }

    const instructor = mockInstructorsData.find(i => i.id === formData.instructorId);
    if (!instructor) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Σφάλμα",
        description: "Το ποσό πρέπει να είναι έγκυρος θετικός αριθμός.",
        variant: "destructive"
      });
      return;
    }

    if (editingAgreement) {
      // Update existing agreement
      setAgreements(prev => prev.map(agreement => 
        agreement.id === editingAgreement.id
          ? {
              ...agreement,
              description: formData.description,
              type: formData.type,
              amount: amount,
              isRecurring: formData.isRecurring,
              startDate: formData.startDate,
              endDate: formData.endDate || undefined
            }
          : agreement
      ));

      toast({
        title: "Συμφωνία Ενημερώθηκε",
        description: `Η συμφωνία για τον ${instructor.name} ενημερώθηκε επιτυχώς.`
      });
    } else {
      // Create new agreement
      const newAgreement: PayrollAgreement = {
        id: `pa_${Date.now()}`,
        instructorId: formData.instructorId,
        instructorName: instructor.name,
        description: formData.description,
        type: formData.type,
        amount: amount,
        isRecurring: formData.isRecurring,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        isActive: true
      };

      setAgreements(prev => [newAgreement, ...prev]);
      
      toast({
        title: "Νέα Συμφωνία",
        description: `Δημιουργήθηκε ${getTypeLabel(formData.type).toLowerCase()} ${amount}€ για τον ${instructor.name}.`
      });
    }

    resetForm();
  };

  const handleEdit = (agreement: PayrollAgreement) => {
    setEditingAgreement(agreement);
    setFormData({
      instructorId: agreement.instructorId,
      description: agreement.description,
      type: agreement.type,
      amount: agreement.amount.toString(),
      isRecurring: agreement.isRecurring,
      startDate: agreement.startDate,
      endDate: agreement.endDate || ''
    });
  };

  const handleDelete = (agreementId: string) => {
    setAgreements(prev => prev.filter(agreement => agreement.id !== agreementId));
    toast({
      title: "Συμφωνία Διαγράφηκε",
      description: "Η συμφωνία μισθοδοσίας διαγράφηκε επιτυχώς."
    });
  };

  const toggleActiveStatus = (agreementId: string) => {
    setAgreements(prev => prev.map(agreement => 
      agreement.id === agreementId 
        ? { ...agreement, isActive: !agreement.isActive }
        : agreement
    ));
  };

  const calculateTotalMonthlyAmount = (instructorId: string) => {
    return filteredAgreements
      .filter(a => a.instructorId === instructorId && a.isActive && a.isRecurring)
      .reduce((total, a) => {
        if (a.type === 'deduction') {
          return total - a.amount;
        }
        return total + a.amount;
      }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="h-4 w-4 mr-2" />
          Ειδικές Συμφωνίες
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Διαχείριση Ειδικών Συμφωνιών Μισθοδοσίας</DialogTitle>
          <DialogDescription>
            Δημιουργία και διαχείριση bonus, αφαιρέσεων και ειδικών τιμών
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Summary Cards */}
          {instructorId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Σύνοψη Μηνιαίων Προσαυξήσεων</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{calculateTotalMonthlyAmount(instructorId).toFixed(2)}€
                </div>
                <p className="text-sm text-muted-foreground">
                  Συνολικό επιπλέον ποσό ανά μήνα
                </p>
              </CardContent>
            </Card>
          )}

          {/* Form για νέα συμφωνία */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAgreement ? 'Επεξεργασία Συμφωνίας' : 'Νέα Συμφωνία Μισθοδοσίας'}
            </h3>
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
                  <Label>Τύπος Συμφωνίας</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({...prev, type: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="deduction">Αφαίρεση</SelectItem>
                      <SelectItem value="special_rate">Ειδική Τιμή</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Περιγραφή</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="π.χ. Έξτρα bonus για υψηλή απόδοση"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ποσό (€)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                    placeholder="100"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Ημερομηνία Έναρξης</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Ημερομηνία Λήξης (προαιρετικό)</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, isRecurring: checked}))}
                />
                <Label htmlFor="recurring">Επαναλαμβανόμενη μηνιαία συμφωνία</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  <Plus className="h-4 w-4 mr-2" />
                  {editingAgreement ? 'Ενημέρωση' : 'Δημιουργία'} Συμφωνίας
                </Button>
                {editingAgreement && (
                  <Button variant="outline" onClick={resetForm}>
                    Ακύρωση
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Πίνακας υπαρχουσών συμφωνιών */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Υπάρχουσες Συμφωνίες</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {!instructorId && <TableHead>Προπονητής</TableHead>}
                  <TableHead>Περιγραφή</TableHead>
                  <TableHead>Τύπος</TableHead>
                  <TableHead>Ποσό</TableHead>
                  <TableHead>Περίοδος</TableHead>
                  <TableHead>Επαναλαμβανόμενη</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgreements.map((agreement) => (
                  <TableRow key={agreement.id}>
                    {!instructorId && (
                      <TableCell className="font-medium">
                        {agreement.instructorName}
                      </TableCell>
                    )}
                    <TableCell className="max-w-64 truncate">{agreement.description}</TableCell>
                    <TableCell>{getTypeBadge(agreement.type)}</TableCell>
                    <TableCell>
                      <span className={agreement.type === 'deduction' ? 'text-red-600' : 'text-green-600'}>
                        {agreement.type === 'deduction' ? '-' : '+'}€{agreement.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(agreement.startDate), 'dd/MM/yyyy', { locale: el })}</div>
                        {agreement.endDate && (
                          <div className="text-muted-foreground">
                            έως {format(new Date(agreement.endDate), 'dd/MM/yyyy', { locale: el })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {agreement.isRecurring ? (
                        <Badge variant="default">Μηνιαία</Badge>
                      ) : (
                        <Badge variant="outline">Εφάπαξ</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={agreement.isActive}
                        onCheckedChange={() => toggleActiveStatus(agreement.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(agreement)}
                          title="Επεξεργασία"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(agreement.id)}
                          className="text-destructive hover:text-destructive"
                          title="Διαγραφή"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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