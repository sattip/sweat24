import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Calendar, Heart, Users, CheckCircle, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { SignupData } from "../SignupSteps";

interface ReviewStepProps {
  data: SignupData;
  onComplete: () => void;
  onPrev: () => void;
  loading?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ 
  data, 
  onComplete, 
  onPrev, 
  loading = false 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Δεν έχει οριστεί";
    
    try {
      // Parse the date string (expecting YYYY-MM-DD format from backend)
      const date = parseISO(dateString);
      
      // Check if the parsed date is valid
      if (!isValid(date)) {
        return "Μη έγκυρη ημερομηνία";
      }
      
      // Format for display as DD/MM/YYYY
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.warn('Date parsing error:', error);
      return "Μη έγκυρη ημερομηνία";
    }
  };

  const formatGender = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      male: "Άνδρας",
      female: "Γυναίκα"
    };
    return genderMap[gender] || "Δεν έχει οριστεί";
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold">Επισκόπηση Στοιχείων</h3>
        <p className="text-muted-foreground">
          Παρακαλώ ελέγξτε τα στοιχεία σας πριν την ολοκλήρωση της εγγραφής
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Βασικά Στοιχεία
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Όνομα</p>
              <p className="font-medium">{data.firstName || "Δεν έχει οριστεί"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Επώνυμο</p>
              <p className="font-medium">{data.lastName || "Δεν έχει οριστεί"}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="font-medium">{data.email || "Δεν έχει οριστεί"}</span>
            </div>
            
            {data.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Τηλέφωνο:</span>
                <span className="font-medium">{data.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Γέννηση:</span>
              <span className="font-medium">{formatDate(data.birthDate)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Φύλο:</span>
              <span className="font-medium">{formatGender(data.gender)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Ιατρικές Πληροφορίες
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Ιατρικές παθήσεις</p>
            {data.hasConditions ? (
              <div className="space-y-2">
                <Badge variant="secondary">Υπάρχουν παθήσεις</Badge>
                {data.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {data.conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                )}
                {data.otherCondition && (
                  <p className="text-sm text-muted-foreground">
                    Άλλο: {data.otherCondition}
                  </p>
                )}
                {data.doctorClearance && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ιατρική έγκριση
                  </Badge>
                )}
              </div>
            ) : (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Χωρίς ιατρικές παθήσεις
              </Badge>
            )}
          </div>

          {data.medications && (
            <div>
              <p className="text-sm text-muted-foreground">Φάρμακα</p>
              <p className="text-sm">{data.medications}</p>
            </div>
          )}

          {data.injuries && (
            <div>
              <p className="text-sm text-muted-foreground">Τραυματισμοί</p>
              <p className="text-sm">{data.injuries}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Επείγουσα Επικοινωνία
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Όνομα</p>
            <p className="font-medium">{data.emergencyContactName || "Δεν έχει οριστεί"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Τηλέφωνο</p>
            <p className="font-medium">{data.emergencyContactPhone || "Δεν έχει οριστεί"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} disabled={loading}>
          Πίσω
        </Button>
        <Button onClick={onComplete} disabled={loading} className="min-w-[120px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Εγγραφή...
            </>
          ) : (
            "Ολοκλήρωση Εγγραφής"
          )}
        </Button>
      </div>

      {/* Info Message */}
      <div className="text-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
        Μετά την εγγραφή, θα λάβετε email επιβεβαίωσης και θα μπορείτε να συνδεθείτε στον λογαριασμό σας.
        Ο λογαριασμός σας θα είναι σε κατάσταση αναμονής μέχρι την επιβεβαίωση από τη γραμματεία.
      </div>
    </div>
  );
}; 