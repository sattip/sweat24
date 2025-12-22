import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  History,
  Wallet
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/apiService";
import { buildApiUrl } from "@/config/api";
import { cn } from "@/lib/utils";

interface UserPackage {
  id: number;
  package_name: string;
  status: string;
  start_date: string;
  end_date: string;
  total_sessions?: number;
  remaining_sessions?: number;
  sessions_used?: number;
  price?: number;
  amount_paid?: number;
  amount_remaining?: number;
  installments?: number;
  installments_paid?: number;
  is_active?: boolean;
}

interface Installment {
  id: number;
  amount: number;
  due_date: string;
  status: string;
  paid_at?: string;
  installment_number?: number;
}

interface InstallmentPackage {
  id: number;
  package_name: string;
  total_amount: number;
  amount_paid: number;
  amount_remaining: number;
  installments: Installment[];
}

interface InstallmentData {
  has_pending_payments: boolean;
  total_amount_remaining: number;
  packages: InstallmentPackage[];
}

const PackagesPage: React.FC = () => {
  const { user } = useAuth();
  const [activePackages, setActivePackages] = useState<UserPackage[]>([]);
  const [packageHistory, setPackageHistory] = useState<UserPackage[]>([]);
  const [installmentData, setInstallmentData] = useState<InstallmentData | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active packages
        const activePkgs = await profileService.getActivePackages();
        const activeList = Array.isArray(activePkgs) ? activePkgs : [];
        setActivePackages(activeList);

        // Fetch package history
        try {
          const token = localStorage.getItem("auth_token");
          const historyResponse = await fetch(buildApiUrl("/my-packages/history"), {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (historyResponse.ok) {
            const result = await historyResponse.json();
            setPackageHistory(result.data || result || []);
          }
        } catch (e) {
          // History endpoint may not exist
        }

        // Fetch installment data
        try {
          const token = localStorage.getItem("auth_token");
          const installmentResponse = await fetch(buildApiUrl("/my-partial-payments"), {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (installmentResponse.ok) {
            const result = await installmentResponse.json();
            setInstallmentData(result.data || result);
          }
        } catch (e) {
          // Installment endpoint may not exist
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const getStatusBadge = (status: string, isActive?: boolean) => {
    const statusLower = status?.toLowerCase();
    if (isActive || statusLower === "active" || statusLower === "ενεργό") {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ενεργό</Badge>;
    }
    if (statusLower === "expired" || statusLower === "ληγμένο") {
      return <Badge variant="secondary">Ληγμένο</Badge>;
    }
    if (statusLower === "cancelled" || statusLower === "ακυρωμένο") {
      return <Badge variant="destructive">Ακυρωμένο</Badge>;
    }
    if (statusLower === "frozen" || statusLower === "παγωμένο") {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Παγωμένο</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />

      {/* Page Header */}
      <div className="bg-red-800 text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Τα Πακέτα μου</h1>
          </div>
          <p className="text-red-200 text-sm mt-1">
            Διαχειριστείτε τα πακέτα και τις πληρωμές σας
          </p>
        </div>
      </div>

      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="current" className="text-xs sm:text-sm">
              <Package className="h-4 w-4 mr-1 hidden sm:inline" />
              Ενεργά
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs sm:text-sm">
              <Wallet className="h-4 w-4 mr-1 hidden sm:inline" />
              Οικονομικά
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              <History className="h-4 w-4 mr-1 hidden sm:inline" />
              Ιστορικό
            </TabsTrigger>
          </TabsList>

          {/* Current/Active Packages Tab */}
          <TabsContent value="current" className="space-y-4">
            {activePackages.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Δεν έχετε ενεργά πακέτα</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Επικοινωνήστε με τη γραμματεία για να αποκτήσετε ένα πακέτο
                  </p>
                </CardContent>
              </Card>
            ) : (
              activePackages.map((pkg) => (
                <Card key={pkg.id} className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{(pkg as any).name || pkg.package_name || "Πακέτο"}</CardTitle>
                      {getStatusBadge(pkg.status, pkg.is_active)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Έναρξη</p>
                          <p className="font-medium text-sm">{formatDate((pkg as any).assigned_date || pkg.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Λήξη</p>
                          <p className="font-medium text-sm">{formatDate((pkg as any).expires_at || (pkg as any).expiry_date || pkg.end_date)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sessions */}
                    {pkg.total_sessions && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Συνεδρίες</span>
                          <span className="font-semibold">
                            {pkg.remaining_sessions ?? 0} / {pkg.total_sessions} απομένουν
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${((pkg.remaining_sessions ?? 0) / pkg.total_sessions) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Installments info if applicable */}
                    {pkg.installments && pkg.installments > 1 && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-700">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium text-sm">Δόσεις</span>
                        </div>
                        <p className="text-sm mt-1">
                          {pkg.installments_paid ?? 0} / {pkg.installments} πληρωμένες
                        </p>
                        {pkg.amount_remaining && pkg.amount_remaining > 0 && (
                          <p className="text-sm text-amber-700 font-medium mt-1">
                            Υπόλοιπο: {formatCurrency(pkg.amount_remaining)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            {!installmentData || !installmentData.has_pending_payments ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="font-medium text-green-700">Είστε ενήμεροι!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Δεν έχετε εκκρεμείς οικονομικές υποχρεώσεις
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Οικονομική Κατάσταση
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">Συνολικό Υπόλοιπο</p>
                      <p className="text-3xl font-bold text-amber-700">
                        {formatCurrency(installmentData.total_amount_remaining)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Packages with installments */}
                {installmentData.packages.map((pkg) => {
                  const paidCount = pkg.installments?.filter(i => i.status === "paid").length || 0;
                  const totalCount = pkg.installments?.length || 0;

                  return (
                    <Card key={pkg.id} className="border-0 shadow-lg overflow-hidden">
                      <CardHeader className="pb-2 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{pkg.package_name}</CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {paidCount}/{totalCount} δόσεις
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Installments List */}
                        <div className="divide-y">
                          {pkg.installments?.map((inst, idx) => {
                            const isPaid = inst.status === "paid";
                            const isOverdue = !isPaid && new Date(inst.due_date) < new Date();
                            const isPending = !isPaid && !isOverdue;

                            return (
                              <div
                                key={inst.id ?? `inst-${pkg.id}-${idx}`}
                                className={cn(
                                  "flex items-center justify-between px-4 py-3",
                                  isPaid && "bg-green-50/50",
                                  isOverdue && "bg-red-50",
                                  isPending && "bg-white"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {isPaid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                  {isOverdue && <AlertCircle className="h-5 w-5 text-red-500" />}
                                  {isPending && <Clock className="h-5 w-5 text-muted-foreground" />}
                                  <div>
                                    <p className={cn(
                                      "font-medium",
                                      isPaid && "text-green-700",
                                      isOverdue && "text-red-700"
                                    )}>
                                      Δόση {inst.installment_number || idx + 1}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(inst.due_date)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={cn(
                                    "font-semibold",
                                    isPaid && "text-green-700",
                                    isOverdue && "text-red-700"
                                  )}>
                                    {formatCurrency(inst.amount)}
                                  </p>
                                  {isPaid && (
                                    <span className="text-xs text-green-600">Πληρωμένη</span>
                                  )}
                                  {isOverdue && (
                                    <Badge variant="destructive" className="text-[10px]">
                                      Εκπρόθεσμη
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Package Summary */}
                        <div className="bg-muted/30 px-4 py-3 flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Πληρωμένο: {formatCurrency(pkg.amount_paid)}
                          </span>
                          <span className="font-medium">
                            Υπόλοιπο: {formatCurrency(pkg.amount_remaining)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Payment hint */}
                <p className="text-xs text-muted-foreground text-center py-2">
                  Για πληρωμή, επικοινωνήστε με τη γραμματεία ή επισκεφθείτε το studio
                </p>
              </>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {packageHistory.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-8 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Δεν υπάρχει ιστορικό πακέτων</p>
                </CardContent>
              </Card>
            ) : (
              packageHistory.map((pkg) => (
                <Card key={pkg.id} className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-300" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{(pkg as any).name || pkg.package_name || "Πακέτο"}</CardTitle>
                      {getStatusBadge(pkg.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate((pkg as any).assigned_date || pkg.start_date)} - {formatDate((pkg as any).expires_at || (pkg as any).expiry_date || pkg.end_date)}</span>
                      </div>
                    </div>
                    {pkg.total_sessions && (
                      <p className="text-sm mt-2">
                        Συνεδρίες: {pkg.sessions_used ?? 0} / {pkg.total_sessions} χρησιμοποιήθηκαν
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PackagesPage;
