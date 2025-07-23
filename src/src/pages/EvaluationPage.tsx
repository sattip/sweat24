import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl } from "@/config/api";

const EvaluationPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [formData, setFormData] = useState({
    overall_rating: 0,
    instructor_rating: 0,
    facility_rating: 0,
    comments: "",
    tags: [] as string[],
    would_recommend: true,
  });

  useEffect(() => {
    fetchEvaluation();
  }, [token]);

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(buildApiUrl(`/evaluations/${token}`));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load evaluation');
      }
      
      if (data.success) {
        setEvaluation(data.evaluation);
      }
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά τη φόρτωση της αξιολόγησης");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate ratings
    if (!formData.overall_rating || !formData.instructor_rating || !formData.facility_rating) {
      toast.error("Παρακαλώ βαθμολογήστε όλες τις κατηγορίες");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(
        buildApiUrl(`/evaluations/${token}/submit`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit evaluation');
      }
      
      if (data.success) {
        setSubmitted(true);
        toast.success(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την υποβολή της αξιολόγησης");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= value
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                } hover:text-yellow-400 transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Αξιολόγηση Μη Διαθέσιμη</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Η αξιολόγηση που ζητήσατε δεν είναι διαθέσιμη ή έχει λήξει.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Ευχαριστούμε!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Η αξιολόγησή σας υποβλήθηκε με επιτυχία. Οι απόψεις σας είναι πολύτιμες για εμάς!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Αξιολόγηση Μαθήματος</CardTitle>
            <div className="text-sm text-muted-foreground space-y-1 mt-2">
              <p><strong>Μάθημα:</strong> {evaluation.class.name}</p>
              <p><strong>Ημερομηνία:</strong> {evaluation.class.date}</p>
              <p><strong>Εκπαιδευτής:</strong> {evaluation.class.instructor}</p>
              <p><strong>Λήγει:</strong> {evaluation.expires_at}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Overall Rating */}
              <StarRating
                value={formData.overall_rating}
                onChange={(val) => setFormData(prev => ({ ...prev, overall_rating: val }))}
                label="Συνολική Βαθμολογία"
              />

              {/* Instructor Rating */}
              <StarRating
                value={formData.instructor_rating}
                onChange={(val) => setFormData(prev => ({ ...prev, instructor_rating: val }))}
                label="Βαθμολογία Εκπαιδευτή"
              />

              {/* Facility Rating */}
              <StarRating
                value={formData.facility_rating}
                onChange={(val) => setFormData(prev => ({ ...prev, facility_rating: val }))}
                label="Βαθμολογία Εγκαταστάσεων"
              />

              {/* Quick Tags */}
              <div className="space-y-2">
                <Label>Επιλέξτε ετικέτες που περιγράφουν την εμπειρία σας</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(evaluation.available_tags).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleTag(key)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.tags.includes(key)
                          ? "bg-primary text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">Σχόλια (προαιρετικό)</Label>
                <Textarea
                  id="comments"
                  placeholder="Μοιραστείτε μαζί μας την εμπειρία σας..."
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.comments.length}/1000 χαρακτήρες
                </p>
              </div>

              {/* Would Recommend */}
              <div className="space-y-2">
                <Label>Θα συστήνατε αυτό το μάθημα;</Label>
                <RadioGroup
                  value={formData.would_recommend ? "yes" : "no"}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, would_recommend: val === "yes" }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Ναι</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">Όχι</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Υποβολή Αξιολόγησης
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EvaluationPage;