import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    name: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
  };
  onViewEvent: () => void;
}

const EventNotification: React.FC<EventNotificationProps> = ({
  open,
  onOpenChange,
  event,
  onViewEvent,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Νέα Εκδήλωση!</DialogTitle>
          <DialogDescription className="text-center">
            Μην χάσετε την επερχόμενη εκδήλωσή μας
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <img 
            src={event.imageUrl} 
            alt={event.name} 
            className="w-full h-32 object-cover rounded-lg"
          />
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{event.date} στις {event.time}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              onViewEvent();
            }}
            variant="outline"
            className="w-full"
          >
            Δείτε Λεπτομέρειες
          </Button>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Εντάξει
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventNotification; 