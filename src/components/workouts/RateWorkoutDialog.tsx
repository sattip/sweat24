
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, ThumbsUp } from "lucide-react";

interface RateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: {
    id: number;
    name: string;
    date: string;
    instructor: string;
    type: string;
  } | null;
}

type IntensityRating = "Easy" | "Moderate" | "Challenging" | "Difficult" | "Very Difficult";

const RateWorkoutDialog: React.FC<RateWorkoutDialogProps> = ({
  open,
  onOpenChange,
  workout
}) => {
  const { toast } = useToast();
  
  const [overallRating, setOverallRating] = useState<number>(0);
  const [intensityRating, setIntensityRating] = useState<IntensityRating>("Moderate");
  const [coachRating, setCoachRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  
  const handleSubmitRating = () => {
    // In a real application, this would send the rating to the backend
    console.log({
      workoutId: workout?.id,
      overallRating,
      intensityRating,
      coachRating,
      feedback
    });
    
    // Show success message
    toast({
      title: "Thank you for your feedback!",
      description: "Your rating has been submitted successfully.",
      duration: 3000,
    });
    
    // Reset form and close dialog
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
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
          <DialogTitle>Rate your "{workout.name}" workout</DialogTitle>
          <DialogDescription>
            Completed on {workout.date} with instructor {workout.instructor}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Overall Experience Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Overall Experience</label>
            <StarRating rating={overallRating} setRating={setOverallRating} />
          </div>
          
          {/* Workout Intensity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Workout Intensity</label>
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
            <label className="text-sm font-medium">Coach Performance</label>
            <StarRating rating={coachRating} setRating={setCoachRating} />
          </div>
          
          {/* Comments/Feedback */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Comments (Optional)
            </label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts about this workout..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-between sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmitRating}
            disabled={overallRating === 0}
            className="gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateWorkoutDialog;
