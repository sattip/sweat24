import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  DollarSign,
  CreditCard,
  Building
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockCashRegisterEntries } from "@/data/mockData";
import type { CashRegisterEntry } from "@/data/mockData";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'withdrawal';
  onSuccess: () => void;
}

export function CashRegisterModal({ isOpen, onClose, type, onSuccess }: CashRegisterModalProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CashRegisterEntry[]>(mockCashRegisterEntries);
  const [formData, setFormData] = useState({
    type: type,
    amount: '',
    description: '',
    category: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer'
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, type: type }));
  }, [type]);

  const incomeCategories = [
    'Package Payment',
    'Personal Training', 
    'Retail Sales',
    'Day Pass',
    'Other Income'
  ];

  const withdrawalCategories = [
    'Owner Withdrawal',
    'Cash Deposit',
    'Petty Cash',
    'Change Fund',
    'Other Withdrawal'
  ];

  const getCurrentCategories = () => {
    return formData.type === 'income' ? incomeCategories : withdrawalCategories;
  };

  const handleAddEntry = () => {
    if (!formData.amount || !formData.description || !formData.category) {
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

    const newEntry: CashRegisterEntry = {
      id: `cr_${Date.now()}`,
      type: formData.type,
      amount: amount,
      description: formData.description,
      category: formData.category,
      timestamp: new Date().toISOString(),
      userId: "admin1", // Θα έρθει από context
      paymentMethod: formData.paymentMethod
    };

    setEntries(prev => [newEntry, ...prev]);

    const actionText = formData.type === 'income' ? 'Έσοδο' : 'Ανάληψη';
    toast({
      title: `${actionText} Καταγράφηκε`,
      description: `${actionText} €${amount} καταγράφηκε επιτυχώς στο ταμείο.`
    });

    // Reset form
    setFormData({
      type: type,
      amount: '',
      description: '',
      category: '',
      paymentMethod: 'cash'
    });

    // Call onSuccess to refresh parent data
    onSuccess();
    onClose();
  };

  // Calculations
  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });

  const todayIncome = todayEntries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const todayWithdrawals = todayEntries
    .filter(entry => entry.type === 'withdrawal')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const currentBalance = todayIncome - todayWithdrawals;

  const totalIncome = entries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalWithdrawals = entries
    .filter(entry => entry.type === 'withdrawal')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const cashBalance = entries
    .filter(entry => entry.paymentMethod === 'cash')
    .reduce((sum, entry) => {
      return entry.type === 'income' ? sum + entry.amount : sum - entry.amount;
    }, 0);

  const getEntryIcon = (entry: CashRegisterEntry) => {
    if (entry.type === 'income') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'transfer':
        return <Building className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Live Ταμείο - Παρακολούθηση σε Πραγματικό Χρόνο</DialogTitle>
          <DialogDescription>
            Καταγραφή εσόδων και αναλήψεων με άμεση ενημέρωση υπολοίπου
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Live Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Σημερινά Έσοδα
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">€{todayIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {todayEntries.filter(e => e.type === 'income').length} συναλλαγές
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Σημερινές Αναλήψεις
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">€{todayWithdrawals.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {todayEntries.filter(e => e.type === 'withdrawal').length} αναλήψεις
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Καθαρό Σημερινό
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{currentBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Έσοδα - Αναλήψεις
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Μετρητά στο Ταμείο
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{cashBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Μόνο cash συναλλαγές
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="new-entry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new-entry">Νέα Καταχώρηση</TabsTrigger>
              <TabsTrigger value="history">Ιστορικό Συναλλαγών</TabsTrigger>
            </TabsList>

            {/* New Entry Tab */}
            <TabsContent value="new-entry" className="space-y-4">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Καταχώρηση Νέας Συναλλαγής</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Τύπος Συναλλαγής</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({...prev, type: value, category: ''}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              Έσοδο
                            </div>
                          </SelectItem>
                          <SelectItem value="withdrawal">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              Ανάληψη
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Κατηγορία</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλογή κατηγορίας" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCurrentCategories().map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>Μέθοδος Πληρωμής</Label>
                      <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData(prev => ({...prev, paymentMethod: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Μετρητά
                            </div>
                          </SelectItem>
                          <SelectItem value="card">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Κάρτα
                            </div>
                          </SelectItem>
                          <SelectItem value="transfer">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Τραπεζικό έμβασμα
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Περιγραφή</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Περιγράψτε τη συναλλαγή..."
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleAddEntry} className="w-fit">
                    <Plus className="h-4 w-4 mr-2" />
                    Καταχώρηση Συναλλαγής
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Πρόσφατες Συναλλαγές</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ώρα</TableHead>
                      <TableHead>Τύπος</TableHead>
                      <TableHead>Κατηγορία</TableHead>
                      <TableHead>Περιγραφή</TableHead>
                      <TableHead>Μέθοδος</TableHead>
                      <TableHead>Ποσό</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.slice(0, 15).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(entry.timestamp), 'HH:mm', { locale: el })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEntryIcon(entry)}
                            {entry.type === 'income' ? 'Έσοδο' : 'Ανάληψη'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-64 truncate">{entry.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(entry.paymentMethod || 'cash')}
                            {entry.paymentMethod === 'cash' ? 'Μετρητά' : 
                             entry.paymentMethod === 'card' ? 'Κάρτα' : 'Έμβασμα'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={entry.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {entry.type === 'income' ? '+' : '-'}€{entry.amount.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 