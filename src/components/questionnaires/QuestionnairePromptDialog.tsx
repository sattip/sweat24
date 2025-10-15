import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QuestionnaireType } from "@/services/questionnaireService";

interface QuestionnairePromptDialogProps {
  questionnaire: QuestionnaireType | null;
  open: boolean;
  onStart: (questionnaire: QuestionnaireType) => void;
  onLater: (questionnaire: QuestionnaireType) => void;
  onIgnore: (questionnaire: QuestionnaireType) => void;
}

export const QuestionnairePromptDialog: React.FC<QuestionnairePromptDialogProps> = ({
  questionnaire,
  open,
  onStart,
  onLater,
  onIgnore,
}) => {
  const totalRequired = useMemo(() => {
    if (!questionnaire) return 0;
    return questionnaire.questions.filter((question) => question.required).length;
  }, [questionnaire]);

  if (!questionnaire) {
    return null;
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📋 {questionnaire.title}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            {questionnaire.description ? (
              <p>{questionnaire.description}</p>
            ) : (
              <p>
                Έχουμε ένα σύντομο ερωτηματολόγιο για εσένα. Βοήθησέ μας να
                βελτιώσουμε την εμπειρία σου!
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{questionnaire.questions.length} ερωτήσεις</Badge>
              {totalRequired > 0 && (
                <Badge variant="outline">{totalRequired} υποχρεωτικές</Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground flex items-center gap-2">
            Γιατί αξίζει να το συμπληρώσεις;
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Μοιράζεσαι feedback για να σε υποστηρίξουμε καλύτερα</li>
            <li>Μας βοηθάς να βελτιώσουμε τις υπηρεσίες και τα προγράμματά μας</li>
            <li>Χρειάζονται μόλις λίγα λεπτά</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex w-full sm:w-auto gap-2">
            <Button
              variant="ghost"
              className="flex-1 sm:flex-initial"
              onClick={() => onIgnore(questionnaire)}
            >
              Παράβλεψη
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial"
              onClick={() => onLater(questionnaire)}
            >
              Υπενθύμισέ το αργότερα
            </Button>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => onStart(questionnaire)}
          >
            Ξεκίνησε τώρα
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
