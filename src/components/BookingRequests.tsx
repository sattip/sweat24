import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileText
} from 'lucide-react';
import { bookingRequestService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

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
  // Legacy support for old field name
  date_time_preferences?: Array<{
    date: string;
    time_from: string;
    time_to: string;
  }>;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  scheduled_date?: string;
  scheduled_time?: string;
}

const statusConfig = {
  pending: {
    label: 'Εκκρεμεί',
    variant: 'default' as const,
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200'
  },
  approved: {
    label: 'Εγκρίθηκε',
    variant: 'default' as const,
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  confirmed: {
    label: 'Επιβεβαιώθηκε',
    variant: 'success' as const,
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  scheduled: {
    label: 'Προγραμματίστηκε',
    variant: 'success' as const,
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  completed: {
    label: 'Ολοκληρώθηκε',
    variant: 'success' as const,
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300'
  },
  rejected: {
    label: 'Απορρίφθηκε',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200'
  },
  cancelled: {
    label: 'Ακυρώθηκε',
    variant: 'secondary' as const,
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200'
  }
};

const timePeriodLabels = {
  morning: 'Πρωί',
  afternoon: 'Απόγευμα',
  evening: 'Βράδυ'
};

export const BookingRequests: React.FC = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [failedCancellations, setFailedCancellations] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookingRequests();
    }
  }, [user]);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 BookingRequests: Starting fetch');
      console.log('🔍 BookingRequests: User from context:', user);
      console.log('🔍 BookingRequests: localStorage sweat93_user:', localStorage.getItem('sweat93_user'));
      console.log('🔍 BookingRequests: localStorage auth_token exists:', !!localStorage.getItem('auth_token'));
      
      const requests = await bookingRequestService.getMyRequests();
      console.log('🔍 BookingRequests: Requests returned:', requests);
      
      // Debug: Log all statuses
      if (Array.isArray(requests)) {
        requests.forEach(req => {
          console.log('🔍 Request status:', req.status, 'for request ID:', req.id);
        });
      }
      
      setBookingRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error('🔍 BookingRequests: Error fetching booking requests:', error);
      toast.error('Σφάλμα κατά τη φόρτωση των αιτημάτων');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      console.log('🔍 Starting cancel for request ID:', requestId);
      await bookingRequestService.cancel(requestId, 'Ακύρωση από τον χρήστη');
      toast.success('Το αίτημα ακυρώθηκε επιτυχώς');
      fetchBookingRequests(); // Refresh the list
    } catch (error: any) {
      console.error('🔍 Cancel error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('Unauthorized')) {
        toast.error('Δεν έχετε δικαίωμα να ακυρώσετε αυτό το αίτημα. Μπορεί να έχει ήδη επεξεργαστεί.');
      } else if (error.message?.includes('403')) {
        toast.error('Δεν επιτρέπεται η ακύρωση αυτού του αιτήματος.');
      } else {
        toast.error(error.message || 'Σφάλμα κατά την ακύρωση');
      }
    }
  };

  const filteredRequests = bookingRequests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'approved') return ['approved', 'confirmed', 'scheduled'].includes(request.status);
    if (activeTab === 'completed') return ['rejected', 'cancelled', 'completed'].includes(request.status);
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Αιτήματα Ραντεβού</h2>
        <p className="text-muted-foreground">
          Παρακολουθήστε την κατάσταση των αιτημάτων σας για EMS και Personal Training
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Όλα</TabsTrigger>
          <TabsTrigger value="pending">Εκκρεμή</TabsTrigger>
          <TabsTrigger value="approved">Εγκεκριμένα</TabsTrigger>
          <TabsTrigger value="completed">Ολοκληρωμένα</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {activeTab === 'all' ? 'Δεν έχετε αιτήματα ραντεβού' : `Δεν έχετε ${activeTab === 'pending' ? 'εκκρεμή' : activeTab === 'approved' ? 'εγκεκριμένα' : 'ολοκληρωμένα'} αιτήματα`}
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === 'all' ? 'Μπορείτε να υποβάλετε αίτημα για EMS ή Personal Training από τη σελίδα υπηρεσιών.' : ''}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                console.log('🔍 Processing request with status:', request.status);
                
                let statusInfo = statusConfig[request.status];
                
                if (!statusInfo) {
                  console.log('🔍 Status not found in config, using fallback for:', request.status);
                  statusInfo = {
                    label: request.status || 'Άγνωστο',
                    variant: 'secondary' as const,
                    icon: AlertCircle,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 border-gray-200'
                  };
                }
                
                const StatusIcon = statusInfo?.icon || AlertCircle;

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
    </div>
  );
}; 