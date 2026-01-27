
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowRight, Loader2, ClipboardList, Calendar, Clock, User, MessageSquare, AlertCircle, CheckCircle2, XCircle, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import * as API from "@/config/api";
import { bookingRequestService } from "@/services/apiService";
import { toast } from "sonner";
import { format } from "date-fns";
import { el } from "date-fns/locale";

// Class type from booking wizard
type ClassType = {
  id: number;
  name: string;
  value: string;
  description?: string;
  icon?: string;
  color?: string;
};

interface BookingRequest {
  id: number;
  service_type: string;
  service_name: string;
  preferred_trainer_id?: number;
  trainer_name?: string;
  preferred_time_slots?: Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>;
  date_time_preferences?: Array<{
    date: string;
    time_from: string;
    time_to: string;
  }>;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'confirmed' | 'scheduled' | 'completed';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  scheduled_date?: string;
  scheduled_time?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string; bgColor: string }> = {
  pending: {
    label: 'Εκκρεμεί',
    variant: 'default',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200'
  },
  approved: {
    label: 'Εγκρίθηκε',
    variant: 'default',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  confirmed: {
    label: 'Επιβεβαιώθηκε',
    variant: 'default',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  scheduled: {
    label: 'Προγραμματίστηκε',
    variant: 'default',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  completed: {
    label: 'Ολοκληρώθηκε',
    variant: 'default',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300'
  },
  rejected: {
    label: 'Απορρίφθηκε',
    variant: 'destructive',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200'
  },
  cancelled: {
    label: 'Ακυρώθηκε',
    variant: 'secondary',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200'
  }
};

const SpecializedServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "services");
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    fetchClassTypes();
    fetchBookingRequests();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const fetchClassTypes = async () => {
    try {
      // Fetch all active class types (no user filter - show all categories)
      const response = await API.apiRequest('/class-types?active_only=1');
      if (!response.ok) {
        throw new Error('Failed to fetch class types');
      }
      const data = await response.json();

      // Sort by display_order
      if (data.data && Array.isArray(data.data)) {
        const sorted = data.data.sort((a: ClassType, b: ClassType) =>
          (a as any).display_order - (b as any).display_order
        );
        setClassTypes(sorted);
      } else if (Array.isArray(data)) {
        setClassTypes(data);
      } else {
        console.error('Unexpected response format:', data);
        setClassTypes([]);
      }
    } catch (error) {
      console.error('Error fetching class types:', error);
      setClassTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      setRequestsLoading(true);
      const requests = await bookingRequestService.getMyRequests();
      setBookingRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await bookingRequestService.cancel(requestId, 'Ακύρωση από τον χρήστη');
      toast.success('Το αίτημα ακυρώθηκε επιτυχώς');
      fetchBookingRequests();
    } catch (error: any) {
      toast.error(error.message || 'Σφάλμα κατά την ακύρωση');
    }
  };

  const renderIcon = (icon?: string, color?: string) => {
    // If it's an emoji, render it directly
    if (icon && icon.length <= 4) {
      return <span className="text-4xl">{icon}</span>;
    }
    // Otherwise render a default icon with the category color
    return <Dumbbell className="h-10 w-10" style={{ color: color || '#dc2626' }} />;
  };

  const pendingCount = bookingRequests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Header */}
      <div className="bg-red-800 text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Αιτήματα Ραντεβού</h1>
                <p className="text-white/80 text-sm">Personal Training & EMS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="services" className="text-xs sm:text-sm px-2">
              Νέο Αίτημα
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm px-2 flex items-center justify-center gap-1">
              <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Τα Αιτήματά μου {pendingCount > 0 && `(${pendingCount})`}</span>
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <div className="mb-4">
              <p className="text-muted-foreground">
                Επιλέξτε κατηγορία μαθήματος για να ζητήσετε ραντεβού
              </p>
            </div>

            <div className="grid gap-4">
              {classTypes.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-muted-foreground">
                      Δεν υπάρχουν διαθέσιμες κατηγορίες αυτή τη στιγμή
                    </CardTitle>
                  </CardHeader>
                </Card>
              ) : (
                classTypes.map((classType) => (
                  <Card key={classType.id} className="hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{classType.name}</CardTitle>
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: classType.color ? `${classType.color}20` : '#fee2e2' }}
                        >
                          {renderIcon(classType.icon, classType.color)}
                        </div>
                      </div>
                      {classType.description && (
                        <CardDescription>{classType.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter className="pt-2 border-t">
                      <Link to={`/services/request/${classType.value}`} className="w-full">
                        <Button variant="outline" className="w-full flex justify-between items-center">
                          Αίτημα Ραντεβού
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-6">
            {requestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : bookingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Δεν έχετε αιτήματα ραντεβού</h3>
                  <p className="text-muted-foreground mb-4">
                    Μπορείτε να υποβάλετε αίτημα από την καρτέλα "Νέο Αίτημα"
                  </p>
                  <Button variant="outline" onClick={() => handleTabChange('services')}>
                    Νέο Αίτημα
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookingRequests.map((request) => {
                  const statusInfo = statusConfig[request.status] || {
                    label: request.status || 'Άγνωστο',
                    variant: 'secondary' as const,
                    icon: AlertCircle,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 border-gray-200'
                  };
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card key={request.id} className={`border-l-4 ${statusInfo.bgColor}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                            <div>
                              <CardTitle className="text-lg">{request.service_name}</CardTitle>
                              <CardDescription>
                                Υποβλήθηκε στις {format(new Date(request.created_at), 'dd MMM yyyy', { locale: el })}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Trainer Information */}
                        {request.trainer_name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Προτιμώμενος γυμναστής: {request.trainer_name}</span>
                          </div>
                        )}

                        {/* Date/Time Preferences */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Προτιμώμενες ημερομηνίες & ώρες:</span>
                          </div>
                          <div className="ml-6 space-y-2">
                            {(request.preferred_time_slots || request.date_time_preferences || []).map((pref, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">
                                  {format(new Date(pref.date), 'dd MMM yyyy', { locale: el })}
                                </span>
                                <span className="text-muted-foreground mx-2">•</span>
                                <span>
                                  {(pref as any).start_time || (pref as any).time_from} - {(pref as any).end_time || (pref as any).time_to}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Scheduled Information (if approved) */}
                        {request.status === 'approved' && request.scheduled_date && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Επιβεβαιωμένο Ραντεβού</span>
                            </div>
                            <div className="text-sm text-green-700">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(request.scheduled_date), 'dd MMM yyyy', { locale: el })}
                              </div>
                              {request.scheduled_time && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {request.scheduled_time}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {request.notes && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Σημειώσεις:</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">{request.notes}</p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {request.admin_notes && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Σημείωση από τη γραμματεία</span>
                            </div>
                            <p className="text-sm text-blue-700">{request.admin_notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {request.status === 'pending' && (
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelRequest(request.id)}
                            >
                              Ακύρωση Αιτήματος
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SpecializedServicesPage;
