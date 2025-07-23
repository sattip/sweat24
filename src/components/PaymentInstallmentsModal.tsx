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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, Plus, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mockPaymentInstallments, mockCustomers, mockCustomerPricingAccess, mockGymPackages } from "@/data/mockData";
import type { PaymentInstallment, CustomerPricingAccess, GymPackage } from "@/data/mockData";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface PaymentInstallmentsModalProps {
  customerId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentInstallmentsModal({ customerId, isOpen, onClose, onSuccess }: PaymentInstallmentsModalProps) {
  const { toast } = useToast();
  const [installments, setInstallments] = useLocalStorage<PaymentInstallment[]>('payment-installments', mockPaymentInstallments);
  const [pricingAccess, setPricingAccess] = useLocalStorage<CustomerPricingAccess[]>('pricing-access', mockCustomerPricingAccess);
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    packageId: '',
    totalAmount: '',
    installmentCount: '1',
    firstDueDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: ''
  });

  const filteredInstallments = customerId 
    ? installments.filter(inst => inst.customerId === customerId)
    : installments;

  const getCustomerName = (id: string) => {
    const customer = mockCustomers.find(c => c.id === id);
    return customer?.name || 'Άγνωστος';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Πληρωμένη
        </Badge>;
      case 'pending':
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Εκκρεμεί
        </Badge>;
      case 'overdue':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Καθυστέρηση
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateInstallments = () => {
    if (!formData.customerId || !formData.packageId || !formData.totalAmount) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    const installmentCount = parseInt(formData.installmentCount);
    const installmentAmount = totalAmount / installmentCount;

    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast({
        title: "Σφάλμα",
        description: "Το συνολικό ποσό πρέπει να είναι έγκυρος θετικός αριθμός.",
        variant: "destructive"
      });
      return;
    }

    const customer = mockCustomers.find(c => c.id === formData.customerId);
    const selectedPackage = mockGymPackages.find(p => p.id === formData.packageId);
    if (!customer || !selectedPackage) return;

    // Δημιουργία δόσεων
    const newInstallments: PaymentInstallment[] = [];
    const firstDueDate = new Date(formData.firstDueDate);

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(firstDueDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      newInstallments.push({
        id: `inst_${Date.now()}_${i}`,
        customerId: formData.customerId,
        customerName: customer.name,
        packageId: formData.packageId,
        packageName: selectedPackage.name,
        installmentNumber: i + 1,
        totalInstallments: installmentCount,
        amount: Math.round(installmentAmount * 100) / 100,
        dueDate: format(dueDate, 'yyyy-MM-dd'),
        status: 'pending',
        notes: formData.notes
      });
    }

    setInstallments(prev => [...newInstallments, ...prev]);

    toast({
      title: "Δόσεις Δημιουργήθηκαν",
      description: `Δημιουργήθηκαν ${installmentCount} δόσεις για τον ${customer.name}.`
    });

    // Reset form
    setFormData({
      customerId: customerId || '',
      packageId: '',
      totalAmount: '',
      installmentCount: '1',
      firstDueDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'cash',
      notes: ''
    });

    onSuccess();
    onClose();
  };

  const handlePayInstallment = (installmentId: string, paymentMethod: 'cash' | 'card' | 'transfer') => {
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) return;

    // Έλεγχος αν είναι η πρώτη πληρωμή του πελάτη
    const customerAccess = pricingAccess.find(access => access.customerId === installment.customerId);
    const isFirstPayment = !customerAccess?.hasAccess;

    // Ενημέρωση δόσης
    setInstallments(prev => prev.map(inst => 
      inst.id === installmentId 
        ? { 
            ...inst, 
            status: 'paid',
            paidDate: format(new Date(), 'yyyy-MM-dd'),
            paymentMethod: paymentMethod
          }
        : inst
    ));

    if (isFirstPayment) {
      // Αυτόματο ξεκλείδωμα τιμοκαταλόγου
      const updatedAccess: CustomerPricingAccess = {
        customerId: installment.customerId,
        customerName: installment.customerName,
        hasAccess: true,
        firstPurchaseDate: format(new Date(), 'yyyy-MM-dd'),
        firstPurchaseAmount: installment.amount,
        unlockedBy: "admin1", // Θα έρθει από context
        unlockedAt: new Date().toISOString(),
        notes: "Αυτόματο ξεκλείδωμα μετά την πρώτη πληρωμή"
      };

      setPricingAccess(prev => {
        const filtered = prev.filter(access => access.customerId !== installment.customerId);
        return [updatedAccess, ...filtered];
      });

      toast({
        title: "🎉 ΤΙΜΟΚΑΤΑΛΟΓΟΣ ΞΕΚΛΕΙΔΩΘΗΚΕ!",
        description: `Η πρώτη πληρωμή €${installment.amount} καταγράφηκε και ο τιμοκατάλογος ενεργοποιήθηκε για τον ${installment.customerName}!`,
        duration: 8000,
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } else {
      toast({
        title: "Πληρωμή Καταγράφηκε ✅",
        description: `Η δόση των €${installment.amount} καταγράφηκε επιτυχώς.`
      });
    }
  };

  const overdueSummary = filteredInstallments.filter(inst => inst.status === 'overdue');
  const pendingSummary = filteredInstallments.filter(inst => inst.status === 'pending');
  const totalPending = pendingSummary.reduce((sum, inst) => sum + inst.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Διαχείριση Δόσεων Πληρωμής</DialogTitle>
          <DialogDescription>
            Δημιουργία δόσεων για πελάτες και καταγραφή πληρωμών όταν πληρώνουν
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Summary Cards */}
          {customerId && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Εκκρεμείς Δόσεις</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingSummary.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Σύνολο: €{totalPending.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Καθυστερημένες</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueSummary.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Απαιτείται επικοινωνία
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Πρόσβαση Τιμοκαταλόγου</CardTitle>
                </CardHeader>
                <CardContent>
                  {pricingAccess.find(access => access.customerId === customerId)?.hasAccess ? (
                    <div className="text-2xl font-bold text-green-600">✓</div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">✗</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Κατάσταση πρόσβασης
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Form για νέες δόσεις */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">📝 Δημιουργία Νέων Δόσεων</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {!customerId && (
                  <div>
                    <Label>Πελάτης</Label>
                    <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({...prev, customerId: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλογή πελάτη" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Πακέτο</Label>
                  <Select 
                    value={formData.packageId} 
                    onValueChange={(value) => {
                      const selectedPackage = mockGymPackages.find(p => p.id === value);
                      setFormData(prev => ({
                        ...prev, 
                        packageId: value,
                        totalAmount: selectedPackage ? selectedPackage.price.toString() : ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλογή πακέτου" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockGymPackages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{pkg.name}</span>
                            <span className="ml-2 text-muted-foreground">€{pkg.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Συνολικό Ποσό (€)</Label>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({...prev, totalAmount: e.target.value}))}
                    placeholder="600"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Αριθμός Δόσεων</Label>
                  <Select value={formData.installmentCount} onValueChange={(value) => setFormData(prev => ({...prev, installmentCount: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 δόση</SelectItem>
                      <SelectItem value="2">2 δόσεις</SelectItem>
                      <SelectItem value="3">3 δόσεις</SelectItem>
                      <SelectItem value="6">6 δόσεις</SelectItem>
                      <SelectItem value="12">12 δόσεις</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Πρώτη Προθεσμία</Label>
                  <Input
                    type="date"
                    value={formData.firstDueDate}
                    onChange={(e) => setFormData(prev => ({...prev, firstDueDate: e.target.value}))}
                  />
                </div>
              </div>
              <div>
                <Label>Σημειώσεις</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Προαιρετικές σημειώσεις..."
                  rows={2}
                />
              </div>
              <Button onClick={handleCreateInstallments} className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Δημιουργία Δόσεων
              </Button>
            </div>
          </div>

          {/* Πίνακας δόσεων */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-700">💰 Καταγραφή Πληρωμών</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {!customerId && <TableHead>Πελάτης</TableHead>}
                  <TableHead>Πακέτο</TableHead>
                  <TableHead>Δόση</TableHead>
                  <TableHead>Ποσό</TableHead>
                  <TableHead>Προθεσμία</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.slice(0, 10).map((installment) => (
                  <TableRow key={installment.id}>
                    {!customerId && (
                      <TableCell className="font-medium">
                        {installment.customerName}
                      </TableCell>
                    )}
                    <TableCell>{installment.packageName}</TableCell>
                    <TableCell>
                      {installment.installmentNumber}/{installment.totalInstallments}
                    </TableCell>
                    <TableCell>€{installment.amount}</TableCell>
                    <TableCell>
                      {format(new Date(installment.dueDate), 'dd/MM/yyyy', { locale: el })}
                    </TableCell>
                    <TableCell>{getStatusBadge(installment.status)}</TableCell>
                    <TableCell>
                      {installment.status === 'pending' || installment.status === 'overdue' ? (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayInstallment(installment.id, 'cash')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          >
                            💵 ΠΛΗΡΩΣΗ Μετρητά
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayInstallment(installment.id, 'card')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            💳 ΠΛΗΡΩΣΗ Κάρτα
                          </Button>
                        </div>
                      ) : (
                        installment.paidDate && (
                          <div className="text-sm text-muted-foreground">
                            Πληρώθηκε: {format(new Date(installment.paidDate), 'dd/MM/yyyy', { locale: el })}
                          </div>
                        )
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