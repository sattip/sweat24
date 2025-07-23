import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, ArrowRight } from 'lucide-react';
import { bookingRequestService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface ApprovedAppointment {
  id: number;
  service_name: string;
  service_type: string;
  trainer_name?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status: string;
  created_at: string;
}

export const ApprovedAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<ApprovedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchApprovedAppointments();
    }
  }, [user]);

  const fetchApprovedAppointments = async () => {
    try {
      setLoading(true);
      const requests = await bookingRequestService.getMyRequests();
      
      // Filter for approved/confirmed/scheduled appointments
      const approvedRequests = (Array.isArray(requests) ? requests : [])
        .filter(request => ['approved', 'confirmed', 'scheduled'].includes(request.status))
        .slice(0, 3); // Show only next 3 appointments
      
      setAppointments(approvedRequests);
    } catch (error) {
      console.error('Error fetching approved appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAppointmentDate = (dateString?: string) => {
    if (!dateString) return 'Προς επιβεβαίωση';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: el });
    } catch {
      return dateString;
    }
  };

  const formatAppointmentTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Show only HH:MM
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Εγκεκριμένα Ραντεβού
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Εγκεκριμένα Ραντεβού
        </CardTitle>
        <CardDescription>
          Τα επερχόμενα ραντεβού σας για EMS και Personal Training
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Δεν έχετε εγκεκριμένα ραντεβού</p>
            <Link to="/services">
              <Button variant="outline" className="mt-4">
                Κλείστε ραντεβού
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{appointment.service_name}</h3>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        {appointment.status === 'approved' ? 'Εγκρίθηκε' : 
                         appointment.status === 'confirmed' ? 'Επιβεβαιώθηκε' : 'Προγραμματίστηκε'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatAppointmentDate(appointment.scheduled_date)}</span>
                        {appointment.scheduled_time && (
                          <>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{formatAppointmentTime(appointment.scheduled_time)}</span>
                          </>
                        )}
                      </div>
                      
                      {appointment.trainer_name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Γυμναστής: {appointment.trainer_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Sweat93 Gym</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <Link to="/profile?tab=booking-requests">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  Δείτε όλα τα αιτήματα
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 