import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Package, Star } from "lucide-react";
import { dashboardApi } from "@/services/apiService";

export function DashboardStats() {
  const [stats, setStats] = useState([
    {
      title: "Συνολικά Μέλη",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Ενεργά Μέλη",
      value: "0",
      change: "+0%",
      changeType: "positive" as const,
      icon: Calendar,
    },
    {
      title: "Μηνιαία Έσοδα",
      value: "€0",
      change: "+0%",
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "Εκκρεμείς Πληρωμές",
      value: "0",
      change: "0 ληξιπρόθεσμες",
      changeType: "neutral" as const,
      icon: Star,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      
      setStats([
        {
          title: "Συνολικά Μέλη",
          value: data.total_members.toString(),
          change: "+12.5%",
          changeType: "positive" as const,
          icon: Users,
        },
        {
          title: "Ενεργά Μέλη",
          value: data.active_members.toString(),
          change: "+8.2%",
          changeType: "positive" as const,
          icon: Calendar,
        },
        {
          title: "Μηνιαία Έσοδα",
          value: `€${data.monthly_revenue.toFixed(2)}`,
          change: "+15.8%",
          changeType: "positive" as const,
          icon: Package,
        },
        {
          title: "Εκκρεμείς Πληρωμές",
          value: data.pending_payments.toString(),
          change: `${data.overdue_payments} ληξιπρόθεσμες`,
          changeType: data.overdue_payments > 0 ? "negative" as const : "neutral" as const,
          icon: Star,
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      data-oid="g3-iwo5"
    >
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-card border border-border hover:shadow-md transition-shadow"
          data-oid="_b3cpca"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-3"
            data-oid="vf2.2s:"
          >
            <CardTitle
              className="text-sm font-medium text-muted-foreground"
              data-oid="dkayemm"
            >
              {stat.title}
            </CardTitle>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
              data-oid="wl0nqd6"
            >
              <stat.icon
                className="h-5 w-5 text-primary"
                data-oid=".oxe94d"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0" data-oid="ra.as:-">
            <div
              className="text-2xl font-bold text-card-foreground"
              data-oid="ordo.y:"
            >
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1" data-oid="5vlxj6-">
              <span
                className={`font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
                data-oid="x87732c"
              >
                {stat.change}
              </span>{" "}
              {stat.title !== "Εκκρεμείς Πληρωμές" ? "από τον προηγούμενο μήνα" : ""}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
