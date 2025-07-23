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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockBusinessExpenses } from "@/data/mockData";
import type { BusinessExpense } from "@/data/mockData";
import { format } from "date-fns";

interface BusinessExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BusinessExpenseModal({ isOpen, onClose, onSuccess }: BusinessExpenseModalProps) {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<BusinessExpense[]>(mockBusinessExpenses);
  const [formData, setFormData] = useState({
    category: '' as 'utilities' | 'equipment' | 'maintenance' | 'supplies' | 'marketing' | 'other' | '',
    subcategory: '',
    description: '',
    amount: '',
    vendor: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: ''
  });

  const categoryOptions = [
    { value: 'utilities', label: 'Λειτουργικά (ρεύμα, νερό, κλπ)' },
    { value: 'equipment', label: 'Εξοπλισμός & Συντήρηση' },
    { value: 'maintenance', label: 'Συντήρηση Χώρου' },
    { value: 'supplies', label: 'Αναλώσιμα & Καθαριστικά' },
    { value: 'marketing', label: 'Μάρκετινγ & Διαφήμιση' },
    { value: 'other', label: 'Άλλα' }
  ];

  const handleAddExpense = () => {
    if (!formData.category || !formData.description || !formData.amount) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Σφάλμα",
        description: "Το ποσό πρέπει να είναι έγκυρος θετικός αριθμός.",
        variant: "destructive"
      });
      return;
    }

    const newExpense: BusinessExpense = {
      id: `exp_${Date.now()}`,
      category: formData.category as any,
      subcategory: formData.subcategory || formData.category,
      description: formData.description,
      amount: amount,
      date: format(new Date(), 'yyyy-MM-dd'),
      vendor: formData.vendor,
      paymentMethod: formData.paymentMethod,
      approved: false,
      notes: formData.notes
    };

    setExpenses(prev => [newExpense, ...prev]);

    toast({
      title: "Έξοδο Καταχωρήθηκε",
      description: `Το έξοδο €${amount} καταχωρήθηκε και εκκρεμεί έγκριση.`
    });

    // Reset form
    setFormData({
      category: '' as any,
      subcategory: '',
      description: '',
      amount: '',
      vendor: '',
      paymentMethod: 'cash',
      notes: ''
    });

    onSuccess();
    onClose();
  };

  const handleApprove = (expenseId: string) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === expenseId 
        ? { ...exp, approved: true, approvedBy: "admin1" }
        : exp
    ));

    toast({
      title: "Έξοδο Εγκρίθηκε",
      description: "Το έξοδο εγκρίθηκε επιτυχώς."
    });
  };

  const handleReject = (expenseId: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));

    toast({
      title: "Έξοδο Απορρίφθηκε",
      description: "Το έξοδο απορρίφθηκε και διαγράφηκε.",
      variant: "destructive"
    });
  };

  const pendingExpenses = expenses.filter(exp => !exp.approved);
  const approvedExpenses = expenses.filter(exp => exp.approved);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Καταγραφή Εξόδων Γυμναστηρίου</DialogTitle>
          <DialogDescription>
            Προσθήκη νέου εξόδου και διαχείριση εγκρίσεων
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Σημερινά Έξοδα</div>
              <div className="text-2xl font-bold text-red-600">
                €{expenses
                  .filter(exp => exp.date === format(new Date(), 'yyyy-MM-dd'))
                  .reduce((sum, exp) => sum + exp.amount, 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Εκκρεμή Έξοδα</div>
              <div className="text-2xl font-bold text-orange-600">{pendingExpenses.length}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Εγκεκριμένα</div>
              <div className="text-2xl font-bold text-green-600">{approvedExpenses.length}</div>
            </div>
          </div>

          {/* Form */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Προσθήκη Νέου Εξόδου</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Κατηγορία</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλογή κατηγορίας" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Υποκατηγορία</Label>
                  <Input
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({...prev, subcategory: e.target.value}))}
                    placeholder="π.χ. Ηλεκτρικό ρεύμα"
                  />
                </div>
              </div>

              <div>
                <Label>Περιγραφή</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="π.χ. Λογαριασμός ΔΕΗ Μαΐου"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ποσό (€)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Προμηθευτής (προαιρετικό)</Label>
                  <Input
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({...prev, vendor: e.target.value}))}
                    placeholder="π.χ. ΔΕΗ"
                  />
                </div>
                <div>
                  <Label>Μέθοδος Πληρωμής</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData(prev => ({...prev, paymentMethod: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Μετρητά</SelectItem>
                      <SelectItem value="card">Κάρτα</SelectItem>
                      <SelectItem value="transfer">Τραπεζικό έμβασμα</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Σημειώσεις (προαιρετικό)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Πρόσθετες πληροφορίες..."
                  rows={2}
                />
              </div>

              <Button onClick={handleAddExpense} className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Καταχώρηση Εξόδου
              </Button>
            </div>
          </div>

          {/* Pending Expenses */}
          {pendingExpenses.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-orange-600">
                Εκκρεμή Έξοδα προς Έγκριση ({pendingExpenses.length})
              </h3>
              <div className="space-y-3">
                {pendingExpenses.map(expense => (
                  <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg bg-orange-50">
                    <div className="flex-1">
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.subcategory} • €{expense.amount} • {expense.vendor || 'Χωρίς προμηθευτή'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        onClick={() => handleApprove(expense.id)}
                      >
                        Έγκριση
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        onClick={() => handleReject(expense.id)}
                      >
                        Απόρριψη
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export also the action functions for use in other components
export { BusinessExpenseModal as default };
export const useExpenseActions = () => ({
  handleApprove: (expenseId: string) => {
    // This would be connected to a global state in a real app
    console.log('Approving expense:', expenseId);
  },
  handleReject: (expenseId: string) => {
    // This would be connected to a global state in a real app  
    console.log('Rejecting expense:', expenseId);
  }
}); 