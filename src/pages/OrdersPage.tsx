import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import * as API from "@/config/api";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  ready_at?: string;
  completed_at?: string;
  items: OrderItem[];
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const response = await API.apiRequest(`/orders?user_id=${user.id}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
      pending: { label: "Σε αναμονή", variant: "secondary" },
      processing: { label: "Σε επεξεργασία", variant: "default" },
      ready_for_pickup: { label: "Έτοιμη για παραλαβή", variant: "success" },
      completed: { label: "Ολοκληρωμένη", variant: "success" },
      cancelled: { label: "Ακυρωμένη", variant: "destructive" }
    };

    const config = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "ready_for_pickup":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["pending", "processing", "ready_for_pickup"].includes(order.status);
    if (activeTab === "completed") return order.status === "completed";
    return false;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Οι Παραγγελίες μου</h1>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">Όλες</TabsTrigger>
            <TabsTrigger value="active">Ενεργές</TabsTrigger>
            <TabsTrigger value="completed">Ολοκληρωμένες</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Φόρτωση παραγγελιών...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Δεν υπάρχουν παραγγελίες</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "all" 
                  ? "Δεν έχετε κάνει ακόμα καμία παραγγελία."
                  : activeTab === "active"
                  ? "Δεν έχετε ενεργές παραγγελίες αυτή τη στιγμή."
                  : "Δεν έχετε ολοκληρωμένες παραγγελίες."}
              </p>
              <Button onClick={() => window.location.href = "/store"}>
                Μετάβαση στο Κατάστημα
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Παραγγελία #{order.order_number}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: el })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Προϊόντα:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.product_name}</span>
                          <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Σύνολο</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Status Message */}
                    {order.status === "ready_for_pickup" && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-800">
                          Η παραγγελία σας είναι έτοιμη! Παρακαλούμε περάστε από την υποδοχή για την παραλαβή.
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="text-sm">
                        <span className="font-medium">Σημειώσεις:</span> {order.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;