import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
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
  installment_number?: number;
}

interface PartialPaymentPackage {
  id: number;
  package_name: string;
  total_amount: number;
  amount_paid: number;
  amount_remaining: number;
  installments: Installment[];
  installments_summary?: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
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
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPartialPayments();
  }, [user?.id]);

  if (loading || error || !data || !data.has_pending_payments) {
    return null;
  }

  const hasOverdue = data.packages.some(pkg =>
    pkg.installments?.some(inst =>
      inst.status !== "paid" && new Date(inst.due_date) < new Date()
    )
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  // Count totals across all packages
  const totalInstallments = data.packages.reduce((sum, pkg) =>
    sum + (pkg.installments_summary?.total || pkg.installments?.length || 0), 0
  );
  const paidInstallments = data.packages.reduce((sum, pkg) =>
    sum + (pkg.installments_summary?.paid || pkg.installments?.filter(i => i.status === "paid").length || 0), 0
  );
  const overdueInstallments = data.packages.reduce((sum, pkg) =>
    sum + (pkg.installments_summary?.overdue || pkg.installments?.filter(i =>
      i.status !== "paid" && new Date(i.due_date) < new Date()
    ).length || 0), 0
  );

  return (
    <Card
      className={cn(
        "mb-6 border-0 shadow-lg bg-white overflow-hidden",
        hasOverdue ? "ring-2 ring-red-200" : "ring-1 ring-amber-200"
      )}
    >
      {/* Top accent bar */}
      <div className={cn(
        "h-1",
        hasOverdue
          ? "bg-gradient-to-r from-red-500 to-red-400"
          : "bg-gradient-to-r from-amber-500 to-amber-400"
      )} />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                hasOverdue
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-600"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Εκκρεμείς Πληρωμές</CardTitle>
              <p className="text-sm text-muted-foreground">
                {paidInstallments}/{totalInstallments} δόσεις πληρωμένες
                {overdueInstallments > 0 && (
                  <span className="text-red-600 font-medium ml-2">
                    ({overdueInstallments} εκπρόθεσμες)
                  </span>
                )}
              </p>
            </div>
          </div>
          {hasOverdue && (
            <Badge variant="destructive" className="text-xs">
              Καθυστέρηση
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "p-3 rounded-lg",
            hasOverdue ? "bg-red-50" : "bg-amber-50"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className={cn(
                "h-4 w-4",
                hasOverdue ? "text-red-500" : "text-amber-500"
              )} />
              <span className="text-xs text-muted-foreground">Υπόλοιπο</span>
            </div>
            <p className={cn(
              "font-bold text-xl",
              hasOverdue ? "text-red-700" : "text-amber-700"
            )}>
              {formatCurrency(data.total_amount_remaining)}
            </p>
          </div>

          {data.next_installment_due && (
            <div className={cn(
              "p-3 rounded-lg",
              hasOverdue ? "bg-red-50" : "bg-amber-50"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className={cn(
                  "h-4 w-4",
                  hasOverdue ? "text-red-500" : "text-amber-500"
                )} />
                <span className="text-xs text-muted-foreground">Επόμενη δόση</span>
              </div>
              <p className={cn(
                "font-bold",
                hasOverdue ? "text-red-700" : "text-amber-700"
              )}>
                {formatDate(data.next_installment_due)}
              </p>
              {data.next_installment_amount && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(data.next_installment_amount)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center gap-2 hover:bg-muted/50"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>Απόκρυψη <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Προβολή Αναλυτικά <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 pt-2">
            {data.packages.map((pkg) => {
              const paidCount = pkg.installments?.filter(i => i.status === "paid").length || 0;
              const totalCount = pkg.installments?.length || 0;

              return (
                <div key={pkg.id} className="border rounded-lg overflow-hidden">
                  {/* Package Header */}
                  <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
                    <span className="font-medium text-sm">{pkg.package_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {paidCount}/{totalCount} δόσεις
                    </span>
                  </div>

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
                            "flex items-center justify-between px-3 py-2",
                            isPaid && "bg-green-50/50",
                            isOverdue && "bg-red-50",
                            isPending && "bg-white"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isPaid && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {isOverdue && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            {isPending && (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <span className={cn(
                                "text-sm",
                                isPaid && "text-green-700",
                                isOverdue && "text-red-700 font-medium"
                              )}>
                                Δόση {inst.installment_number || idx + 1}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatDate(inst.due_date)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium text-sm",
                              isPaid && "text-green-700",
                              isOverdue && "text-red-700"
                            )}>
                              {formatCurrency(inst.amount)}
                            </span>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Εκπρόθεσμη
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Package Summary */}
                  <div className="bg-muted/20 px-3 py-2 flex justify-between text-xs text-muted-foreground">
                    <span>Πληρωμένο: {formatCurrency(pkg.amount_paid)}</span>
                    <span className="font-medium text-foreground">
                      Υπόλοιπο: {formatCurrency(pkg.amount_remaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action hint */}
        <p className="text-xs text-muted-foreground text-center border-t pt-3">
          Για πληρωμή, επικοινωνήστε με τη γραμματεία ή επισκεφθείτε το studio
        </p>
      </CardContent>
    </Card>
  );
};

export default PartialPaymentAlert;
