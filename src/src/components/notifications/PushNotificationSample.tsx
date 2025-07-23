
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar, Zap } from "lucide-react";

type NotificationType = "booking" | "reminder" | "offer";

interface PushNotificationSampleProps {
  type: NotificationType;
  time?: string;
}

const PushNotificationSample: React.FC<PushNotificationSampleProps> = ({
  type,
  time = "Just now"
}) => {
  const getNotificationContent = () => {
    switch (type) {
      case "booking":
        return {
          icon: <Calendar className="h-5 w-5 text-primary" />,
          title: "Sweat93",
          message: "Η κράτησή σας για Power Yoga αύριο στις 10:00 π.μ. επιβεβαιώθηκε!",
          greekMessage: "Θα σας στείλουμε υπενθύμιση μία ώρα πριν το μάθημα."
        };
      case "reminder":
        return {
          icon: <Bell className="h-5 w-5 text-secondary" />,
          title: "Sweat93",
          message: "Υπενθύμιση! Το Personal Training σας είναι σε 2 ώρες.",
          greekMessage: "Με την προπονήτρια Μαρία Παπαδοπούλου στο Studio 1."
        };
      case "offer":
        return {
          icon: <Zap className="h-5 w-5 text-yellow-500" />,
          title: "Sweat93",
          message: "Μην χάσετε την προσφορά μας! 20% έκπτωση σε όλα τα συμπληρώματα!",
          greekMessage: "Η προσφορά ισχύει μέχρι την Κυριακή."
        };
      default:
        return {
          icon: <Bell className="h-5 w-5 text-primary" />,
          title: "Sweat93",
          message: "Έχετε μια νέα ειδοποίηση",
          greekMessage: "Πατήστε για να δείτε περισσότερα."
        };
    }
  };

  const content = getNotificationContent();
  
  return (
    <div className="max-w-sm mx-auto my-6">
      <p className="text-xs text-muted-foreground mb-2 text-center">Προεπισκόπηση ειδοποίησης κινητού</p>
      <Card className="border shadow-lg overflow-hidden">
        <div className="h-6 bg-neutral-800 dark:bg-neutral-700 flex items-center px-4">
          <div className="w-1/4">
            <div className="h-1.5 w-8 bg-white/30 rounded-full"></div>
          </div>
          <div className="w-2/4 flex justify-center">
            <div className="h-1.5 w-20 bg-white/30 rounded-full"></div>
          </div>
          <div className="w-1/4 flex justify-end">
            <div className="flex space-x-1">
              <div className="h-1.5 w-1.5 bg-white/30 rounded-full"></div>
              <div className="h-1.5 w-3 bg-white/30 rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
        <CardContent className="p-4 bg-neutral-100 dark:bg-neutral-900">
          <div className="flex items-start space-x-3">
            <div className="mt-1 h-10 w-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
              {content.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold">{content.title}</h3>
                <span className="text-xs text-muted-foreground">Τώρα</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm">{content.message}</p>
                <p className="text-xs text-muted-foreground">{content.greekMessage}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationSample;
