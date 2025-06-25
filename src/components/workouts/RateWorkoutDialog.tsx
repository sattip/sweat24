import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, ThumbsUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trainers } from "@/data/trainers";

interface RateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: {
    id: number;
    name: string;
    date: string;
  } | null;
}

type IntensityRating = "Easy" | "Moderate" | "Challenging" | "Difficult" | "Very Difficult";

const RateWorkoutDialog: React.FC<RateWorkoutDialogProps> = ({
  open,
  onOpenChange,
  workout
}) => {
  const { toast } = useToast();
  
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [overallRating, setOverallRating] = useState<number>(0);
  const [intensityRating, setIntensityRating] = useState<IntensityRating>("Moderate");
  const [coachRating, setCoachRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  
  const handleSubmitRating = () => {
    // In a real application, this would send the rating to the backend
    console.log({
      workoutId: workout?.id,
      selectedTrainer,
      overallRating,
      intensityRating,
      coachRating,
      feedback
    });
    
    // Show success message
    toast({
      title: "Ευχαριστούμε για την αξιολόγηση!",
      description: "Η αξιολόγησή σας υποβλήθηκε με επιτυχία.",
      duration: 3000,
    });
    
    // Reset form and close dialog
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setSelectedTrainer("");
    setOverallRating(0);
    setIntensityRating("Moderate");
    setCoachRating(0);
    setFeedback("");
  };
  
  // Star rating component for reuse
  const StarRating = ({ rating, setRating, max = 5 }: { rating: number, setRating: (rating: number) => void, max?: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          return (
            <Star
              key={index}
              className={`h-6 w-6 cursor-pointer ${
                starValue <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(starValue)}
            />
          );
        })}
      </div>
    );
  };
  
  // Intensity rating buttons
  const intensityOptions: IntensityRating[] = ["Easy", "Moderate", "Challenging", "Difficult", "Very Difficult"];
  
  if (!workout) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Αξιολογήστε την προπόνηση "{workout.name}"</DialogTitle>
          <DialogDescription>
            Ολοκληρώθηκε στις {new Date(workout.date).toLocaleDateString('el-GR')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Trainer Selection */}
          <div className="space-y-2">
            <label htmlFor="trainer-select" className="text-sm font-medium">Επιλέξτε Εκπαιδευτή</label>
            <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
              <SelectTrigger id="trainer-select">
                <SelectValue placeholder="Επιλέξτε τον εκπαιδευτή που σας έκανε μάθημα" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Overall Experience Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Συνολική Εμπειρία</label>
            <StarRating rating={overallRating} setRating={setOverallRating} />
          </div>
          
          {/* Workout Intensity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ένταση Προπόνησης</label>
            <div className="flex flex-wrap gap-2">
              {intensityOptions.map((option) => (
                <Button
                  key={option}
                  variant={intensityRating === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIntensityRating(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Coach Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Απόδοση Εκπαιδευτή</label>
            <StarRating rating={coachRating} setRating={setCoachRating} />
          </div>
          
          {/* Comments/Feedback */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Σχόλια (Προαιρετικά)
            </label>
            <Textarea
              id="feedback"
              placeholder="Μοιραστείτε τις σκέψεις σας για αυτή την προπόνηση..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-between sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Ακύρωση
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmitRating}
            disabled={overallRating === 0 || !selectedTrainer}
            className="gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Υποβολή Αξιολόγησης
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateWorkoutDialog;
