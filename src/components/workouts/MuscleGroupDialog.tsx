import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";
import { muscleGroupService } from "@/services/apiService";

interface MuscleGroup {
  id: string;
  name: string;
  nameEn: string;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: "total_body", name: "Total Body", nameEn: "total_body" },
  { id: "legs", name: "Πόδια", nameEn: "legs" },
  { id: "chest", name: "Στήθος", nameEn: "chest" },
  { id: "back", name: "Πλάτη", nameEn: "back" },
  { id: "shoulders", name: "Ώμοι", nameEn: "shoulders" },
  { id: "arms", name: "Χέρια", nameEn: "arms" },
  { id: "core", name: "Κοιλιακοί", nameEn: "core" },
  { id: "cardio", name: "Καρδιο", nameEn: "cardio" },
];

interface MuscleGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: {
    id: number;
    class_name: string;
    date: string;
  } | null;
  initialMuscleGroups?: string[];
}

const MuscleGroupDialog: React.FC<MuscleGroupDialogProps> = ({
  open,
  onOpenChange,
  workout,
  initialMuscleGroups = [],
}) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    initialMuscleGroups.length > 0 ? initialMuscleGroups : ["total_body"]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved muscle groups when dialog opens
    const loadMuscleGroups = async () => {
      if (open && workout) {
        // Set default immediately to prevent empty state
        const defaultGroups = initialMuscleGroups.length > 0 ? initialMuscleGroups : ["total_body"];
        setSelectedGroups(defaultGroups);

        // Load saved data in background without showing loading state
        const data = await muscleGroupService.getMuscleGroups(workout.id);

        if (data && data.muscle_groups && Array.isArray(data.muscle_groups)) {
          // Update with saved data
          setSelectedGroups(data.muscle_groups);
        }
        // No error handling needed - getMuscleGroups returns null on error
      } else if (!open) {
        // Reset state when dialog closes
        setSelectedGroups(["total_body"]);
      }
    };

    loadMuscleGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, workout?.id]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups((prev) => {
      // If "Total Body" is selected and we're selecting another group, remove "Total Body"
      if (groupId !== "total_body" && prev.includes("total_body")) {
        return [groupId];
      }

      // If we're selecting "Total Body", clear all other selections
      if (groupId === "total_body") {
        return ["total_body"];
      }

      // Toggle the group
      if (prev.includes(groupId)) {
        const newGroups = prev.filter((id) => id !== groupId);
        // If no groups are selected, default to "total_body"
        return newGroups.length === 0 ? ["total_body"] : newGroups;
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSubmit = async () => {
    if (!workout) return;

    try {
      setIsSubmitting(true);

      // Call the API to save muscle groups
      await muscleGroupService.saveMuscleGroups(workout.id, selectedGroups);

      toast.success("Οι μυϊκές ομάδες καταγράφηκαν επιτυχώς!");
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Σφάλμα κατά την καταγραφή των μυϊκών ομάδων";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Καταγραφή Μυϊκών Ομάδων
          </DialogTitle>
          <DialogDescription>
            {workout && (
              <>
                Επιλέξτε τις μυϊκές ομάδες που γυμνάσατε στο μάθημα{" "}
                <span className="font-semibold">{workout.class_name}</span>
                {" "}στις{" "}
                <span className="font-semibold">
                  {new Date(workout.date).toLocaleDateString("el-GR")}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            {MUSCLE_GROUPS.map((group) => (
              <div key={group.id} className="flex items-center space-x-3">
                <Checkbox
                  id={group.id}
                  checked={selectedGroups.includes(group.id)}
                  onCheckedChange={() => handleToggleGroup(group.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  disabled={isLoading}
                />
                <Label
                  htmlFor={group.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {group.name}
                </Label>
              </div>
            ))}
          </div>

          {selectedGroups.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <p className="text-sm font-medium mb-2">Επιλεγμένες ομάδες:</p>
              <div className="flex flex-wrap gap-2">
                {selectedGroups.map((groupId) => {
                  const group = MUSCLE_GROUPS.find((g) => g.id === groupId);
                  return (
                    <span
                      key={groupId}
                      className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {group?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            Ακύρωση
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MuscleGroupDialog;
