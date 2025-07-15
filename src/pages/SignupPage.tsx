
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import SignaturePad, { SignaturePadRef } from "@/components/SignaturePad";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authService } from "@/services/authService";

const SignupPage: React.FC = () => {
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
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Register with signature
      await authService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
        birthDate,
        gender,
        address,
        area,
        referralSource,
        referralName,
        signature: signatureData,
        signedAt: new Date().toISOString(),
        documentType: 'terms_and_conditions',
        documentVersion: '1.0'
      });
      
      toast.success("Επιτυχής εγγραφή! Καλώς ήρθατε στο Sweat24!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Σφάλμα κατά την εγγραφή");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <Card className="w-full shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Εγγραφή στο Sweat24</CardTitle>
            <CardDescription className="text-center">Δημιουργήστε τον λογαριασμό σας για να ξεκινήσετε</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Όνομα</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Το όνομά σας"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Επώνυμο</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Το επώνυμό σας"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="το@email.σας"
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
                <Label htmlFor="password">Κωδικός Πρόσβασης</Label>
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
                <Label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού</Label>
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
                    placeholder="Όνομα του φίλου που σας παρέπεμψε"
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
                <Label htmlFor="terms" className="text-sm">
                  Αποδέχομαι τους{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    όρους χρήσης
                  </Link>{" "}
                  και την{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    πολιτική απορρήτου
                  </Link>
                </Label>
              </div>
              
              {acceptTerms && signatureData && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                  ✓ Έχετε υπογράψει τους όρους και προϋποθέσεις
                </div>
              )}
              
              <Button type="submit" className="w-full">
                Εγγραφή
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Έχετε ήδη λογαριασμό;{" "}
              <Link to="/" className="text-primary font-medium hover:underline">
                Σύνδεση
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Terms and Signature Dialog */}
        <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Όροι Χρήσης και Προϋποθέσεις</DialogTitle>
              <DialogDescription>
                Παρακαλώ διαβάστε προσεκτικά τους όρους χρήσης και υπογράψτε στο τέλος
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
                title="Η Υπογραφή σας"
                description="Υπογράφοντας, δηλώνετε ότι έχετε διαβάσει και αποδέχεστε τους όρους χρήσης"
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
                    toast.error("Παρακαλώ υπογράψτε πριν συνεχίσετε");
                    return;
                  }
                  const signature = signaturePadRef.current?.toDataURL();
                  if (signature) {
                    setSignatureData(signature);
                    setShowTermsDialog(false);
                    toast.success("Η υπογραφή σας αποθηκεύτηκε");
                  }
                }}
              >
                Αποδοχή και Υπογραφή
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SignupPage;
