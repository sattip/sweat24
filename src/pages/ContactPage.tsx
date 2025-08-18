
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Note: In a real app, this would come from authentication/user context
  const userData = {
    name: "",
    email: ""
  };

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
    
    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Form submitted:", data);
      setIsSubmitting(false);
      form.reset();
      
      toast({
        title: "Επιτυχής υποβολή",
        description: "Το μήνυμά σας στάλθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.",
      });
    }, 1000);
  }

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
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Μήνυμα</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Γράψτε το μήνυμά σας εδώ..." 
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
