import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Calendar, 
  MessageCircle, 
  PartyPopper, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: any;
}

// 1. Order Ready Notification
export const OrderReadyNotification: React.FC<NotificationComponentProps> = ({
  open,
  onOpenChange,
  data
}) => {
  const navigate = useNavigate();
  
  const orderNumber = data?.order_number || '#12345';
  const total = data?.total || '€24.90';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <Package className="h-12 w-12 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-green-700">
            Παραγγελία Έτοιμη! 📦
          </DialogTitle>
          <DialogDescription className="text-center">
            Η παραγγελία σας είναι έτοιμη για παραλαβή
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Αριθμός Παραγγελίας:</span>
              <Badge variant="outline">{orderNumber}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Σύνολο:</span>
              <span className="font-semibold">{total}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Παραλαβή από το γυμναστήριο</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Κλείσιμο
          </Button>
          <Button onClick={() => { navigate('/orders'); onOpenChange(false); }}>
            Δείτε Παραγγελίες
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 2. Sessions Ending Notification
export const SessionsEndingNotification: React.FC<NotificationComponentProps> = ({
  open,
  onOpenChange,
  data
}) => {
  const navigate = useNavigate();
  
  const remainingSessions = data?.remaining_sessions || 2;
  const isLastSession = remainingSessions === 1;
  const packageType = data?.package_type || 'Premium';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className={`p-4 rounded-full mb-4 ${isLastSession ? 'bg-red-100' : 'bg-orange-100'}`}>
            {isLastSession ? (
              <AlertTriangle className="h-12 w-12 text-red-600" />
            ) : (
              <Clock className="h-12 w-12 text-orange-600" />
            )}
          </div>
          <DialogTitle className={`text-2xl font-bold text-center ${isLastSession ? 'text-red-700' : 'text-orange-700'}`}>
            {isLastSession ? 'Τελευταία Συνεδρία! ⚠️' : 'Προτελευταία Συνεδρία! 📅'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLastSession 
              ? 'Χρειάζεστε νέο πακέτο για να συνεχίσετε'
              : 'Σκεφτείτε να αγοράσετε νέο πακέτο'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Τρέχον Πακέτο:</span>
              <Badge variant="outline">{packageType}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Υπόλοιπες Συνεδρίες:</span>
              <Badge variant={isLastSession ? "destructive" : "secondary"}>
                {remainingSessions}
              </Badge>
            </div>
          </div>
          
          {isLastSession && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ Μετά από αυτή τη συνεδρία δεν θα μπορείτε να κλείσετε νέα μαθήματα.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Αργότερα
          </Button>
          <Button onClick={() => { navigate('/store'); onOpenChange(false); }}>
            Δείτε Πακέτα
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 3. Chat Message Notification
export const ChatMessageNotification: React.FC<NotificationComponentProps> = ({
  open,
  onOpenChange,
  data
}) => {
  const senderName = data?.sender_name || 'Γραμματεία SWEAT24';
  const messagePreview = data?.message_preview || 'Έχετε λάβει ένα νέο μήνυμα...';
  const isFromAdmin = data?.is_from_admin !== false;

  const handleOpenChat = () => {
    onOpenChange(false);
    // Trigger chat widget opening
    const chatButton = document.querySelector('[data-chat-trigger]') as HTMLElement;
    if (chatButton) {
      chatButton.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <MessageCircle className="h-12 w-12 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-blue-700">
            Νέο Μήνυμα! 💬
          </DialogTitle>
          <DialogDescription className="text-center">
            {isFromAdmin ? 'Μήνυμα από τη γραμματεία' : 'Απάντηση στο μήνυμά σας'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{senderName}</span>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "{messagePreview}"
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Αργότερα
          </Button>
          <Button onClick={handleOpenChat}>
            Ανοίξτε Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 4. New Event Notification
export const NewEventNotification: React.FC<NotificationComponentProps> = ({
  open,
  onOpenChange,
  data
}) => {
  const navigate = useNavigate();
  
  const eventTitle = data?.event_title || 'Summer Fitness Challenge';
  const eventDate = data?.event_date || '25 Ιουλίου 2025';
  const eventLocation = data?.event_location || 'Sweat24 Gym';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <PartyPopper className="h-12 w-12 text-purple-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-purple-700">
            Νέα Εκδήλωση! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Μην χάσετε την επερχόμενη εκδήλωσή μας
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-center">{eventTitle}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{eventDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{eventLocation}</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Κλείσιμο
          </Button>
          <Button onClick={() => { navigate('/events'); onOpenChange(false); }}>
            Δείτε Εκδηλώσεις
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 5. Booking Request Status Notification
export const BookingRequestStatusNotification: React.FC<NotificationComponentProps> = ({
  open,
  onOpenChange,
  data
}) => {
  const navigate = useNavigate();
  
  const status = data?.status || 'approved';
  const serviceName = data?.service_name || 'Personal Training';
  const isApproved = ['approved', 'confirmed', 'scheduled'].includes(status);
  
  const statusConfig = {
    approved: { title: 'Αίτημα Εγκρίθηκε! ✅', color: 'green', message: 'Το αίτημά σας εγκρίθηκε επιτυχώς' },
    confirmed: { title: 'Αίτημα Επιβεβαιώθηκε! ✅', color: 'green', message: 'Το αίτημά σας επιβεβαιώθηκε' },
    scheduled: { title: 'Ραντεβού Προγραμματίστηκε! ✅', color: 'green', message: 'Το ραντεβού σας έχει προγραμματιστεί' },
    rejected: { title: 'Αίτημα Απορρίφθηκε ❌', color: 'red', message: 'Δυστυχώς το αίτημά σας απορρίφθηκε' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.approved;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center">
          <div className={`p-4 rounded-full mb-4 ${isApproved ? 'bg-green-100' : 'bg-red-100'}`}>
            {isApproved ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <DialogTitle className={`text-2xl font-bold text-center ${isApproved ? 'text-green-700' : 'text-red-700'}`}>
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {config.message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Υπηρεσία:</span>
              <Badge variant="outline">{serviceName}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Κατάσταση:</span>
              <Badge variant={isApproved ? "default" : "destructive"}>
                {status === 'approved' ? 'Εγκρίθηκε' : 
                 status === 'confirmed' ? 'Επιβεβαιώθηκε' : 
                 status === 'scheduled' ? 'Προγραμματίστηκε' : 'Απορρίφθηκε'}
              </Badge>
            </div>
          </div>
          
          {isApproved && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Θα επικοινωνήσουμε μαζί σας για τον προγραμματισμό του ραντεβού.
              </p>
            </div>
          )}
          
          {!isApproved && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-700">
                ❌ Μπορείτε να υποβάλετε νέο αίτημα ή να επικοινωνήσετε μαζί μας.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Κλείσιμο
          </Button>
          <Button onClick={() => { navigate('/profile?tab=booking-requests'); onOpenChange(false); }}>
            Δείτε Αιτήματα
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 