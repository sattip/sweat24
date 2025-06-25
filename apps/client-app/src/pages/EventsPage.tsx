import React, { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Bell } from "lucide-react";
import EventNotification from "@/components/notifications/EventNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock data for events
const mockEvents = [
  {
    id: "1",
    name: "Καλοκαιρινό Πάρτι στην παραλία",
    date: "2024-08-02",
    time: "18:00",
    location: "Beach Bar 'Ammos'",
    imageUrl: "/placeholder.svg",
    description: "Ελάτε να γιορτάσουμε το καλοκαίρι με μουσική, χορό και κοκτέιλ διπλά στη θάλασσα. Μια βραδιά για να γνωριστούμε καλύτερα εκτός γυμναστηρίου!",
    attendees: 87,
    type: "Κοινωνική Εκδήλωση",
    details: [
      "Δωρεάν είσοδος για μέλη του γυμναστηρίου",
      "Έκπτωση 20% σε όλα τα ποτά",
      "Live DJ από τις 20:00",
      "Δώρα και διαγωνισμοί όλο το βράδυ",
      "Ειδικό μενού με υγιεινά snacks"
    ]
  },
  {
    id: "2",
    name: "Σεμινάριο Διατροφής & Performance",
    date: "2024-09-15",
    time: "11:00",
    location: "Sweat24 - Αίθουσα Yoga",
    imageUrl: "/placeholder.svg",
    description: "Ο διατροφολόγος μας, κ. Νίκος Γεωργίου, θα μας μιλήσει για το πώς η σωστή διατροφή μπορεί να εκτοξεύσει την απόδοσή μας. Θα ακολουθήσει Q&A.",
    attendees: 45,
    type: "Εκπαιδευτικό",
    details: [
      "Διάρκεια: 2 ώρες",
      "Περιλαμβάνεται δωρεάν υλικό",
      "Δωρεάν δείγματα συμπληρωμάτων",
      "Εξατομικευμένες συμβουλές διατροφής",
      "Πιστοποιητικό συμμετοχής"
    ]
  }
];

const EventsPage = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState({});
  const { toast } = useToast();

  const handleRSVP = (eventId, status) => {
    setRsvpStatus(prev => ({ ...prev, [eventId]: status }));
    toast({
      title: "Η απάντησή σας καταχωρήθηκε!",
      description: `Επιλέξατε "${status === 'yes' ? 'Θα παρευρεθώ' : 'Όχι'}" για την εκδήλωση.`,
      duration: 3000,
    });
  };

  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-6 max-w-5xl mx-auto">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Εκδηλώσεις</h1>
              <p className="text-muted-foreground mt-1">Ελάτε στις εκδηλώσεις μας και γίνετε μέλος της κοινότητάς μας!</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsNotificationOpen(true)}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Προσομοίωση Ειδοποίησης
            </Button>
          </div>
          
          <div className="space-y-8">
            {mockEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img 
                      src={event.imageUrl} 
                      alt={event.name}
                      className="h-48 w-full object-cover md:h-full"
                    />
                  </div>
                  <div className="md:w-2/3 flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{event.name}</CardTitle>
                          <Badge variant="secondary" className="mt-2">{event.type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">{event.attendees} άτομα δήλωσαν συμμετοχή</span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleRSVP(event.id, 'yes')}
                        variant={rsvpStatus[event.id] === 'yes' ? 'default' : 'outline'}
                      >
                        Θα παρευρεθώ
                      </Button>
                      <Button 
                        variant={rsvpStatus[event.id] === 'no' ? 'destructive' : 'outline'}
                        onClick={() => handleRSVP(event.id, 'no')}
                      >
                        Όχι
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => showEventDetails(event)}
                      >
                        Δείτε Λεπτομέρειες
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <EventNotification 
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
        event={{
          id: mockEvents[0].id,
          name: mockEvents[0].name,
          date: "2 Αυγούστου 2024",
          time: mockEvents[0].time,
          location: mockEvents[0].location,
          imageUrl: mockEvents[0].imageUrl
        }}
        onViewEvent={() => {
          setIsNotificationOpen(false);
          showEventDetails(mockEvents[0]);
        }}
      />

      {/* Event Details Modal */}
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <img 
                src={selectedEvent.imageUrl} 
                alt={selectedEvent.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{selectedEvent.attendees} συμμετέχοντες</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Περιγραφή</h3>
                <p className="text-muted-foreground">{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.details && (
                <div>
                  <h3 className="font-semibold mb-2">Επιπλέον Πληροφορίες</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedEvent.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    handleRSVP(selectedEvent.id, 'yes');
                    setIsEventDetailsOpen(false);
                  }}
                  variant={rsvpStatus[selectedEvent.id] === 'yes' ? 'default' : 'outline'}
                >
                  Θα παρευρεθώ
                </Button>
                <Button 
                  variant={rsvpStatus[selectedEvent.id] === 'no' ? 'destructive' : 'outline'}
                  onClick={() => {
                    handleRSVP(selectedEvent.id, 'no');
                    setIsEventDetailsOpen(false);
                  }}
                >
                  Όχι
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventsPage; 