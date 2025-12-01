import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  Package
} from "lucide-react";
import { buildApiUrl } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Installment {
  id: number;
  amount: number;
  due_date: string;
  status: string;
  paid_at?: string;
}

interface PartialPaymentPackage {
  id: number;
  package_name: string;
  total_amount: number;
  amount_paid: number;
  amount_remaining: number;
  installments: Installment[];
}

interface PartialPaymentData {
  has_pending_payments: boolean;
  total_amount_remaining: number;
  next_installment_due?: string;
  next_installment_amount?: number;
  packages: PartialPaymentPackage[];
  upcoming_installments: Installment[];
}

const PartialPaymentAlert: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PartialPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartialPayments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(buildApiUrl("/my-partial-payments"), {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Endpoint doesn't exist yet or no data
            setData(null);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const result = await response.json();
        const paymentData = result.data || result;
        setData(paymentData);
      } catch (err) {
        console.error("Error fetching partial payments:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPartialPayments();
  }, [user?.id]);

  // Don't render if loading, error, no data, or no pending payments
  if (loading || error || !data || !data.has_pending_payments) {
    return null;
  }

  const isOverdue = data.next_installment_due
    ? new Date(data.next_installment_due) < new Date()
    : false;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("el-GR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getPaymentPercentage = (pkg: PartialPaymentPackage) => {
    if (pkg.total_amount === 0) return 100;
    return Math.round((pkg.amount_paid / pkg.total_amount) * 100);
  };

  return (
    <Card
      className={cn(
        "mb-6 border-l-4 shadow-md animate-fade-in",
        isOverdue
          ? "border-l-red-500 bg-red-50 dark:bg-red-950/20"
          : "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "p-2 rounded-full",
                isOverdue
                  ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Εκκρεμείς Πληρωμές
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Σε καθυστέρηση
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Έχετε ανεξόφλητες δόσεις που χρειάζονται την προσοχή σας
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-background/80 rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Συνολικό Υπόλοιπο</p>
              <p className="font-semibold text-lg">
                {formatCurrency(data.total_amount_remaining)}
              </p>
            </div>
          </div>

          {data.next_installment_due && (
            <div className="flex items-center gap-3 p-3 bg-background/80 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Επόμενη Δόση</p>
                <p className={cn(
                  "font-semibold",
                  isOverdue && "text-red-600 dark:text-red-400"
                )}>
                  {formatDate(data.next_installment_due)}
                </p>
                {data.next_installment_amount && (
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(data.next_installment_amount)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Απόκρυψη Λεπτομερειών <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Προβολή Λεπτομερειών <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t">
            {/* Packages with Progress */}
            {data.packages.map((pkg) => (
              <div key={pkg.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{pkg.package_name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {getPaymentPercentage(pkg)}% πληρωμένο
                  </span>
                </div>
                <Progress
                  value={getPaymentPercentage(pkg)}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Πληρωμένο: {formatCurrency(pkg.amount_paid)}</span>
                  <span>Υπόλοιπο: {formatCurrency(pkg.amount_remaining)}</span>
                </div>

                {/* Installments for this package */}
                {pkg.installments && pkg.installments.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2">
                    {pkg.installments.map((inst) => {
                      const instOverdue =
                        inst.status !== "paid" &&
                        new Date(inst.due_date) < new Date();

                      return (
                        <div
                          key={inst.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded text-sm",
                            inst.status === "paid"
                              ? "bg-green-50 dark:bg-green-950/20"
                              : instOverdue
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span>{formatDate(inst.due_date)}</span>
                            {inst.status === "paid" && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Πληρωμένο
                              </Badge>
                            )}
                            {instOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Εκπρόθεσμο
                              </Badge>
                            )}
                          </div>
                          <span className="font-medium">
                            {formatCurrency(inst.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Upcoming Installments Summary */}
            {data.upcoming_installments && data.upcoming_installments.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="font-medium text-sm mb-2">Επερχόμενες Δόσεις</h4>
                <div className="space-y-2">
                  {data.upcoming_installments.slice(0, 3).map((inst) => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <span>{formatDate(inst.due_date)}</span>
                      <span className="font-medium">
                        {formatCurrency(inst.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action hint */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Για πληρωμή, επικοινωνήστε με τη γραμματεία ή επισκεφθείτε το studio
        </p>
      </CardContent>
    </Card>
  );
};

export default PartialPaymentAlert;
