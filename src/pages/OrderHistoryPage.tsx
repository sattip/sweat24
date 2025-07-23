import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  User,
  FileText,
  Loader2,
  ShoppingBag,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { orderHistoryService } from "@/services/apiService";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
  product: {
    id: number;
    name: string;
    image_url: string | null;
    category: string;
    slug: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  subtotal: string;
  tax: string;
  total: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  ready_at: string | null;
  completed_at: string | null;
  created_at: string;
  items: OrderItem[];
}

interface OrderHistoryPageProps {
  hideHeader?: boolean;
  orders?: Order[];
  loading?: boolean;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ 
  hideHeader = false, 
  orders: externalOrders, 
  loading: externalLoading 
}) => {
  const { user } = useAuth();
  const [internalOrders, setInternalOrders] = useState<Order[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);

  // Use external props if provided, otherwise use internal state
  const orders = externalOrders || internalOrders;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    // Only fetch if we're not receiving external data
    if (!externalOrders) {
      fetchOrderHistory();
      
      // Set up polling every 30 seconds for real-time updates
      const pollingInterval = setInterval(() => {
        console.log('🔄 Polling for order updates...');
        fetchOrderHistory();
      }, 30000); // 30 seconds

      // Cleanup interval on unmount
      return () => {
        console.log('🛑 Stopping order polling');
        clearInterval(pollingInterval);
      };
    }
  }, [user, externalOrders]);

  const fetchOrderHistory = async () => {
    if (!user) {
      setInternalLoading(false);
      return;
    }

    try {
      setInternalLoading(true);
      const data = await orderHistoryService.getOrderHistory(user.id);
      
      // Check for status changes if we have previous orders
      if (previousOrders.length > 0) {
        data.forEach((newOrder: Order) => {
          const previousOrder = previousOrders.find(p => p.id === newOrder.id);
          if (previousOrder && previousOrder.status !== newOrder.status) {
            // Status changed - show notification
            const statusMessages: Record<string, string> = {
              processing: `Η παραγγελία ${newOrder.order_number} είναι σε επεξεργασία! 🔄`,
              ready_for_pickup: `Η παραγγελία ${newOrder.order_number} είναι έτοιμη για παραλαβή! 📦`,
              completed: `Η παραγγελία ${newOrder.order_number} ολοκληρώθηκε! ✅`,
              cancelled: `Η παραγγελία ${newOrder.order_number} ακυρώθηκε ❌`
            };
            
            const message = statusMessages[newOrder.status];
            if (message) {
              toast.success(message, {
                duration: 5000,
                action: {
                  label: 'Δες Λεπτομέρειες',
                  onClick: () => openOrderDetails(newOrder)
                }
              });
            }
          }
        });
      }
      
      // Update previous orders for next comparison
      setPreviousOrders([...data]);
      setInternalOrders(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Σφάλμα κατά τη φόρτωση του ιστορικού παραγγελιών');
    } finally {
      setInternalLoading(false);
    }
  };

  const getStatusBadge = (status: string, statusDisplay: string) => {
    const statusConfig: Record<string, { 
      variant: "default" | "secondary" | "destructive" | "outline", 
      className: string 
    }> = {
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      processing: { variant: "default", className: "bg-blue-100 text-blue-800 border-blue-200" },
      ready_for_pickup: { variant: "outline", className: "bg-orange-100 text-orange-800 border-orange-200" },
      completed: { variant: "outline", className: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { variant: "destructive", className: "bg-red-100 text-red-800 border-red-200" }
    };

    const config = statusConfig[status] || { variant: "default", className: "" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {statusDisplay}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <Clock className="h-4 w-4 text-yellow-600" />,
      processing: <Package className="h-4 w-4 text-blue-600" />,
      ready_for_pickup: <AlertTriangle className="h-4 w-4 text-orange-600" />,
      completed: <CheckCircle className="h-4 w-4 text-green-600" />,
      cancelled: <XCircle className="h-4 w-4 text-red-600" />
    };

    return iconMap[status] || <Package className="h-4 w-4 text-gray-600" />;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: el });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `€${numAmount.toFixed(2)}`;
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      supplements: "Συμπληρώματα",
      apparel: "Ρούχα",
      accessories: "Αξεσουάρ",
      equipment: "Εξοπλισμός",
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className={hideHeader ? "" : "min-h-screen bg-background"}>
        {!hideHeader && <Header />}
        <main className={hideHeader ? "" : "container px-4 py-6 max-w-5xl mx-auto"}>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Φόρτωση ιστορικού παραγγελιών...</span>
          </div>
        </main>
      </div>
    );
  }

  const mainContent = (
    <>
      {!hideHeader && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Οι Παραγγελίες μου</h1>
          <p className="text-muted-foreground mt-2">
            Ιστορικό και κατάσταση των παραγγελιών σας από το κατάστημα
          </p>
        </div>
      )}

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Δεν υπάρχουν παραγγελίες</h3>
              <p className="text-muted-foreground mb-4">
                Δεν έχετε κάνει ακόμη καμία παραγγελία από το κατάστημά μας.
              </p>
              <Button onClick={() => window.location.href = '/store'}>
                Επισκεφτείτε το Κατάστημα
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Παραγγελία #{order.order_number}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      {getStatusBadge(order.status, order.status_display)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Products Preview */}
                    <div>
                      <h4 className="font-medium mb-2">Προϊόντα ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="flex-1">
                              {item.quantity}x {item.product_name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-muted-foreground">
                            και {order.items.length - 2} ακόμη προϊόντα...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Σύνολο:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      onClick={() => openOrderDetails(order)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Δες Λεπτομέρειες
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Λεπτομέρειες Παραγγελίας</DialogTitle>
              <DialogDescription>
                Πλήρεις πληροφορίες για την παραγγελία #{selectedOrder?.order_number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6">
                  {/* Order Status Timeline */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Κατάσταση Παραγγελίας
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusBadge(selectedOrder.status, selectedOrder.status_display)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Παραγγελία: {formatDate(selectedOrder.created_at)}
                      {selectedOrder.completed_at && (
                        <div>Ολοκληρώθηκε: {formatDate(selectedOrder.completed_at)}</div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Στοιχεία Παραλαβής
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {selectedOrder.customer_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {selectedOrder.customer_email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedOrder.customer_phone}
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Προϊόντα
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {getCategoryLabel(item.product.category)}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span>Ποσότητα: {item.quantity}</span>
                                <span>Τιμή: {formatCurrency(item.price)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(item.subtotal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h3 className="font-medium mb-3">Σύνοψη Παραγγελίας</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Υποσύνολο:</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ΦΠΑ:</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <span>Σύνολο:</span>
                        <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Σημειώσεις
                      </h3>
                      <p className="text-sm bg-muted p-3 rounded-lg">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </>
    );

  if (hideHeader) {
    return mainContent;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        {mainContent}
      </main>
    </div>
  );
};

export default OrderHistoryPage; 