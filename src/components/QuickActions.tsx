import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Calendar, Package, Bell, Wallet, CreditCard, Receipt } from "lucide-react";
import { PaymentInstallmentsModal } from "./PaymentInstallmentsModal";
import { NotificationSendModal } from "./NotificationSendModal";
import { NewUserModal } from "./NewUserModal";
import { NewClassModal } from "./NewClassModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  {
    title: "Διαχείριση Δόσεων",
    description: "Καταγραφή και παρακολούθηση δόσεων πελατών",
    icon: CreditCard,
    action: "Διαχείριση Δόσεων",
    component: "installments"
  },
  {
    title: "Διαχείριση Ταμείου",
    description: "Καταγραφή εσόδων και εξόδων",
    icon: Wallet,
    action: "Άνοιγμα Ταμείου",
    component: "cashregister"
  },
  {
    title: "Προσθήκη Νέου Μέλους",
    description: "Εγγραφή νέου μέλους στο γυμναστήριο",
    icon: UserPlus,
    action: "Προσθήκη Μέλους",
    component: "newuser"
  },
  {
    title: "Προγραμματισμός Μαθήματος",
    description: "Δημιουργία νέου μαθήματος γυμναστικής",
    icon: Calendar,
    action: "Προγραμματισμός",
    component: "newclass"
  },
  {
    title: "Αποστολή Ειδοποίησης",
    description: "Ενημέρωση όλων των μελών",
    icon: Bell,
    action: "Αποστολή",
    component: "notification"
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  
  const handleCashRegisterClick = () => {
    navigate('/cash-register');
  };

  return (
    <Card
      className="bg-card border border-border rounded-lg shadow-sm"
      data-oid="34upa-q"
    >
      <CardHeader className="p-6" data-oid="h9h:2oz">
        <CardTitle
          className="flex items-center gap-2 text-lg font-semibold text-card-foreground"
          data-oid="n44myba"
        >
          <Plus className="h-5 w-5 text-primary" data-oid="q6z66l5" />
          Γρήγορες Ενέργειες
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0" data-oid="slsp6d_">
        <div className="grid gap-4 md:grid-cols-2" data-oid="5p4zev.">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="flex flex-col gap-3 p-4 rounded-lg border border-border hover:border-accent transition-colors bg-card"
              data-oid="l7z6xxz"
            >
              <div className="flex items-center gap-3" data-oid="__5di2v">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0"
                  data-oid="h_wwubr"
                >
                  <action.icon
                    className="h-5 w-5 text-muted-foreground"
                    data-oid="nwxhhgb"
                  />
                </div>

                <div className="flex-1 min-w-0" data-oid="vg4b5_4">
                  <h3
                    className="font-medium text-card-foreground text-sm leading-tight"
                    data-oid="f6-m85i"
                  >
                    {action.title}
                  </h3>
                  <p
                    className="text-xs text-muted-foreground mt-1 leading-tight"
                    data-oid="_97ddwp"
                  >
                    {action.description}
                  </p>
                </div>
              </div>

              {action.component === "installments" ? (
                <PaymentInstallmentsModal />
              ) : action.component === "cashregister" ? (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3 py-2 rounded-md transition-colors text-xs w-full"
                  onClick={handleCashRegisterClick}
                >
                  {action.action}
                </Button>
              ) : action.component === "notification" ? (
                <NotificationSendModal />
              ) : action.component === "newuser" ? (
                <NewUserModal />
              ) : action.component === "newclass" ? (
                <NewClassModal />
              ) : (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3 py-2 rounded-md transition-colors text-xs w-full"
                  data-oid="y8a53.b"
                >
                  {action.action}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
