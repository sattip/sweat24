import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { UserPlus, Mail, Lock, Phone } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import SignaturePad, { SignaturePadRef } from "./SignaturePad";
import { usersApi } from "@/services/apiService";

interface NewUserModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
  onUserCreated?: (user: any) => void;
}

export function NewUserModal({ 
  isOpen, 
  onOpenChange, 
  triggerButton = true,
  onUserCreated 
}: NewUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [referralName, setReferralName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const signaturePadRef = useRef<SignaturePadRef>(null);

  const handleCreateUser = async () => {
    // Validate form
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Παρακαλώ συμπληρώστε όλα τα πεδία");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Οι κωδικοί πρόσβασης δεν ταιριάζουν");
      return;
    }
    
    if (!acceptTerms) {
      toast.error("Παρακαλώ αποδεχτείτε τους όρους χρήσης");
      return;
    }
    
    if (!signatureData) {
      toast.error("Παρακαλώ υπογράψτε τους όρους και προϋποθέσεις");
      return;
    }

    try {
      // Create new user via API
      const newUserData = {
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        password: password,
        password_confirmation: confirmPassword,
        birth_date: birthDate,
        gender: gender,
        address: address,
        area: area,
        signature: signatureData,
        signed_at: new Date().toISOString(),
        document_type: 'terms_and_conditions',
        document_version: '1.0',
        referral_source: referralSource,
        referral_name: referralName,
        status: 'pending_approval' as const  // Νέοι χρήστες χρειάζονται έγκριση
      };

      const createdUser = await usersApi.create(newUserData);
      
      toast.success(`Ο πελάτης ${firstName} ${lastName} δημιουργήθηκε επιτυχώς!`);
      
      if (onUserCreated) {
        onUserCreated(createdUser);
      }

      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error?.response?.data?.message || "Αποτυχία δημιουργίας πελάτη. Παρακαλώ δοκιμάστε ξανά.");
    }
  };
  
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setBirthDate("");
    setGender("");
    setAddress("");
    setArea("");
    setReferralSource("");
    setReferralName("");
    setAcceptTerms(false);
    setSignatureData("");
  };

  const content = (
    <>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Εγγραφή Νέου Πελάτη</DialogTitle>
          <DialogDescription>Δημιουργήστε νέο λογαριασμό για τον πελάτη</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Όνομα *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Το όνομα του πελάτη"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Επώνυμο *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Το επώνυμο του πελάτη"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="πελάτης@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Τηλέφωνο</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="6901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Ημερομηνία Γέννησης</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Φύλο</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε φύλο" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Άνδρας</SelectItem>
                    <SelectItem value="female">Γυναίκα</SelectItem>
                    <SelectItem value="other">Άλλο</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Διεύθυνση</Label>
              <Input
                id="address"
                type="text"
                placeholder="Οδός και αριθμός"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area">Περιοχή</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε περιοχή" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Κέντρο</SelectItem>
                  <SelectItem value="north">Βόρεια Προάστια</SelectItem>
                  <SelectItem value="south">Νότια Προάστια</SelectItem>
                  <SelectItem value="east">Ανατολικά Προάστια</SelectItem>
                  <SelectItem value="west">Δυτικά Προάστια</SelectItem>
                  <SelectItem value="piraeus">Πειραιάς</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Κωδικός Πρόσβασης *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referralSource">Πώς μάθατε για εμάς;</Label>
              <Select value={referralSource} onValueChange={setReferralSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε μία επιλογή" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend">Από φίλο/γνωστό</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="search">Google</SelectItem>
                  <SelectItem value="ad">Διαφήμιση</SelectItem>
                  <SelectItem value="other">Άλλο</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {referralSource === "friend" && (
              <div className="space-y-2">
                <Label htmlFor="referralName">Όνομα φίλου (προαιρετικό)</Label>
                <Input
                  id="referralName"
                  type="text"
                  placeholder="Όνομα του φίλου που τον παρέπεμψε"
                  value={referralName}
                  onChange={(e) => setReferralName(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => {
                  setAcceptTerms(checked === true);
                  if (checked) {
                    setShowTermsDialog(true);
                  } else {
                    setSignatureData("");
                    signaturePadRef.current?.clear();
                  }
                }}
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                Ο πελάτης αποδέχεται τους{" "}
                <span 
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => setShowTermsDialog(true)}
                >
                  όρους χρήσης
                </span>{" "}
                και την{" "}
                <span 
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => setShowTermsDialog(true)}
                >
                  πολιτική απορρήτου
                </span>
                {" "}*
              </Label>
            </div>
            
            {acceptTerms && signatureData && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                ✓ Ο πελάτης έχει υπογράψει τους όρους και προϋποθέσεις
              </div>
            )}
            
            <Button 
              onClick={handleCreateUser} 
              className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6"
              type="button"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Ολοκλήρωση Εγγραφής
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
      
      {/* Terms and Signature Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Όροι Χρήσης και Προϋποθέσεις</DialogTitle>
            <DialogDescription>
              Παρακαλώ διαβάστε προσεκτικά τους όρους χρήσης και ζητήστε από τον πελάτη να υπογράψει στο τέλος
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-lg">Γενικοί Κανόνες</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Όλα τα μέλη πρέπει να σκανάρουν την κάρτα μελών τους κατά την είσοδο.</li>
                <li>Απαιτείται κατάλληλη αθλητική ενδυμασία και καθαρά αθλητικά παπούτσια.</li>
                <li>Παρακαλούμε φέρτε πετσέτα και χρησιμοποιήστε την κατά τη διάρκεια της προπόνησής σας.</li>
                <li>Καθαρίστε τον εξοπλισμό μετά τη χρήση.</li>
                <li>Επιστρέψτε τα βάρη και τον εξοπλισμό στις κατάλληλες θέσεις τους μετά τη χρήση.</li>
                <li>Σεβαστείτε τον χώρο και τον χρόνο προπόνησης των άλλων μελών.</li>
              </ul>
              
              <h3 className="font-semibold text-lg">Παρακολούθηση Μαθημάτων</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Φτάστε τουλάχιστον 5 λεπτά πριν την έναρξη του μαθήματος.</li>
                <li>Οι καθυστερημένες αφίξεις ενδέχεται να μην επιτρέπονται να συμμετάσχουν σε μαθήματα σε εξέλιξη.</li>
                <li>Οι ακυρώσεις πρέπει να γίνονται τουλάχιστον 4 ώρες πριν την έναρξη του μαθήματος.</li>
                <li>Η μη εμφάνιση θα έχει ως αποτέλεσμα την αφαίρεση του μαθήματος από το πακέτο σας.</li>
              </ul>
              
              <h3 className="font-semibold text-lg">Προσωπική Προπόνηση</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Απαιτείται 24ωρη προειδοποίηση ακύρωσης για όλες τις συνεδρίες προσωπικής προπόνησης.</li>
                <li>Οι καθυστερημένες ακυρώσεις ή η μη εμφάνιση θα χρεωθούν με το πλήρες κόστος της συνεδρίας.</li>
              </ul>
              
              <h3 className="font-semibold text-lg">Χρήση Εγκαταστάσεων</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Η χρήση των ντουλαπιών περιορίζεται στον χρόνο παραμονής σας στις εγκαταστάσεις.</li>
                <li>Το Sweat24 δεν είναι υπεύθυνο για χαμένα ή κλεμμένα αντικείμενα.</li>
                <li>Οι κλήσεις κινητού τηλεφώνου δεν επιτρέπονται στους χώρους προπόνησης.</li>
              </ul>
              
              <h3 className="font-semibold text-lg">Πολιτική Ακύρωσης</h3>
              <p>
                Οι ακυρώσεις συνδρομών πρέπει να γίνονται εγγράφως τουλάχιστον 30 ημέρες πριν την επόμενη χρέωση.
                Δεν γίνονται επιστροφές χρημάτων για μη χρησιμοποιημένες περιόδους.
              </p>
              
              <h3 className="font-semibold text-lg">Προστασία Δεδομένων</h3>
              <p>
                Τα προσωπικά σας δεδομένα θα χρησιμοποιηθούν αποκλειστικά για τους σκοπούς λειτουργίας του γυμναστηρίου
                και δεν θα κοινοποιηθούν σε τρίτους χωρίς τη συγκατάθεσή σας.
              </p>
            </div>
          </ScrollArea>
          
          <div className="mt-4">
            <SignaturePad
              ref={signaturePadRef}
              title="Υπογραφή Πελάτη"
              description="Ο πελάτης υπογράφοντας, δηλώνει ότι έχει διαβάσει και αποδέχεται τους όρους χρήσης"
            />
          </div>
          
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowTermsDialog(false);
                setAcceptTerms(false);
                setSignatureData("");
                signaturePadRef.current?.clear();
              }}
            >
              Ακύρωση
            </Button>
            <Button
              onClick={() => {
                if (signaturePadRef.current?.isEmpty()) {
                  toast.error("Παρακαλώ ζητήστε από τον πελάτη να υπογράψει πριν συνεχίσετε");
                  return;
                }
                const signature = signaturePadRef.current?.toDataURL();
                if (signature) {
                  setSignatureData(signature);
                  setShowTermsDialog(false);
                  toast.success("Η υπογραφή αποθηκεύτηκε");
                }
              }}
            >
              Αποδοχή και Υπογραφή
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (triggerButton) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-primary text-white hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Νέος Πελάτης
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}