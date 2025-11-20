
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Send, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  subject: z.string({
    required_error: "Παρακαλώ επιλέξτε ένα θέμα",
  }),
  message: z.string()
    .min(10, {
      message: "Το μήνυμα πρέπει να είναι τουλάχιστον 10 χαρακτήρες",
    })
    .max(500, {
      message: "Το μήνυμά σας δεν μπορεί να υπερβαίνει τους 500 χαρακτήρες",
    }),
  name: z.string().optional(),
  email: z.string().email({
    message: "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email",
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AvailablePackage {
  id: number;
  name: string;
  price: number;
  sessions?: number;
  duration_days?: number;
  description?: string;
}

const ContactPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<AvailablePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  // Get user data from auth context
  const userData = {
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : "",
    email: user?.email || ""
  };

  // Fetch available packages when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      setLoadingPackages(true);
      try {
        const response = await fetch(buildApiUrl('/packages'));
        if (response.ok) {
          const data = await response.json();
          const packages = Array.isArray(data) ? data : (data.data || []);
          setAvailablePackages(packages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
      name: userData.name,
      email: userData.email,
    },
  });

  function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    // Include selected package info in message if applicable
    let finalMessage = data.message;
    if (data.subject === "package_purchase" && selectedPackageId) {
      const selectedPkg = availablePackages.find(p => p.id === selectedPackageId);
      if (selectedPkg) {
        finalMessage = `[Ενδιαφέρομαι για το πακέτο: ${selectedPkg.name} - ${selectedPkg.price}€]\n\n${data.message}`;
      }
    }

    const submitData = {
      ...data,
      message: finalMessage,
      selected_package_id: selectedPackageId
    };

    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Form submitted:", submitData);
      setIsSubmitting(false);
      form.reset();
      setSelectedPackageId(null);

      toast({
        title: "Επιτυχής υποβολή",
        description: "Το μήνυμά σας στάλθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.",
      });
    }, 1000);
  }

  // Watch for subject changes to reset package selection
  const currentSubject = form.watch("subject");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-3xl py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Επικοινωνία</CardTitle>
            <CardDescription>
              Συμπληρώστε τη φόρμα για να επικοινωνήσετε μαζί μας
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Θέμα</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε θέμα" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">Γενική Ερώτηση</SelectItem>
                          <SelectItem value="package_purchase">Αγορά Πακέτου</SelectItem>
                          <SelectItem value="complaint">Παράπονο</SelectItem>
                          <SelectItem value="suggestion">Πρόταση Βελτίωσης</SelectItem>
                          <SelectItem value="technical">Τεχνικό Πρόβλημα</SelectItem>
                          <SelectItem value="other">Άλλο</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Package Selection - shown when "Αγορά Πακέτου" is selected */}
                {currentSubject === "package_purchase" && (
                  <div className="space-y-3">
                    <FormLabel>Επιλέξτε Πακέτο</FormLabel>
                    {loadingPackages ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Φόρτωση πακέτων...</span>
                      </div>
                    ) : availablePackages.length > 0 ? (
                      <div className="grid gap-2">
                        {availablePackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedPackageId === pkg.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{pkg.name}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {pkg.price}€
                              </Badge>
                            </div>
                            {(pkg.sessions || pkg.duration_days) && (
                              <div className="mt-1 text-xs text-muted-foreground ml-6">
                                {pkg.sessions && <span>{pkg.sessions} συνεδρίες</span>}
                                {pkg.sessions && pkg.duration_days && <span> • </span>}
                                {pkg.duration_days && <span>{pkg.duration_days} ημέρες</span>}
                              </div>
                            )}
                            {pkg.description && (
                              <p className="mt-1 text-xs text-muted-foreground ml-6 line-clamp-2">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                        Δεν βρέθηκαν διαθέσιμα πακέτα. Περιγράψτε το ενδιαφέρον σας στο μήνυμα.
                      </p>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Μήνυμα</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={currentSubject === "package_purchase"
                            ? "Προαιρετικά, γράψτε επιπλέον πληροφορίες ή ερωτήσεις για το πακέτο..."
                            : "Γράψτε το μήνυμά σας εδώ..."
                          }
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-muted/50 p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-3">Στοιχεία Επικοινωνίας</h4>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ονοματεπώνυμο</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Υποβολή..."
                  ) : (
                    <>
                      <Send className="mr-1" />
                      Αποστολή Μηνύματος
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
