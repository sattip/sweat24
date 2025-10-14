import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  questionnaireService,
  QuestionnaireType,
} from "@/services/questionnaireService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const QUERY_KEY = "questionnaires-active";

type QuestionnaireState = {
  questionnaire?: QuestionnaireType;
};

const QuestionRenderer = ({
  question,
  value,
  onChange,
  index,
}: {
  question: QuestionnaireType["questions"][number];
  value: unknown;
  onChange: (index: number, value: unknown) => void;
  index: number;
}) => {
  const label = `${index + 1}. ${question.question}`;

  switch (question.type) {
    case "text":
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          <Textarea
            value={(value as string) ?? ""}
            onChange={(event) => onChange(index, event.target.value)}
            placeholder="Γράψε την απάντησή σου εδώ..."
            rows={4}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          <Input
            type="number"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(event) => {
              const raw = event.target.value;
              onChange(index, raw === "" ? "" : Number(raw));
            }}
            placeholder="Εισαγωγή αριθμού"
          />
        </div>
      );

    case "rating":
    case "rating_10": {
      const maxRating = question.type === "rating" ? 5 : 10;
      const currentValue = Number(value) || 0;

      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: maxRating }, (_, idx) => idx + 1).map((rating) => (
              <Button
                key={rating}
                type="button"
                variant={currentValue === rating ? "default" : "outline"}
                onClick={() => onChange(index, rating)}
                className={cn(
                  "w-10 h-10 p-0",
                  currentValue === rating && "border-primary"
                )}
              >
                {rating}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    case "multiple_choice":
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {question.options?.map((option) => (
              <Button
                key={option}
                type="button"
                variant={value === option ? "default" : "outline"}
                onClick={() => onChange(index, option)}
                className="text-sm"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      );

    case "yes_no":
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={value === true ? "default" : "outline"}
              onClick={() => onChange(index, true)}
            >
              Ναι
            </Button>
            <Button
              type="button"
              variant={value === false ? "default" : "outline"}
              onClick={() => onChange(index, false)}
            >
              Όχι
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const QuestionnaireDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useLocation() as QuestionnaireState;

  const numericId = Number(id);
  const { user } = useAuth();

  const { data = [], isLoading } = useQuery<QuestionnaireType[]>({
    queryKey: [QUERY_KEY, "detail", user?.id],
    queryFn: () => questionnaireService.getActiveQuestionnaires(user?.id),
    enabled: Boolean(user?.id),
  });

  const questionnaire = useMemo(() => {
    if (state?.questionnaire && state.questionnaire.id === numericId) {
      return state.questionnaire;
    }
    return data.find((item) => item.id === numericId);
  }, [data, numericId, state?.questionnaire]);

  const [responses, setResponses] = useState<Record<number, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = questionnaire?.questions ?? [];
  const totalQuestions = questions.length;
  const totalAnswered = questions.filter((_, index) => {
    const value = responses[index];
    return value !== undefined && value !== "";
  }).length;

  const progress = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const handleChange = (index: number, value: unknown) => {
    setResponses((previous) => ({
      ...previous,
      [index]: value,
    }));
  };

  const validateResponses = () => {
    if (!questionnaire) return [] as number[];

    const missing: number[] = [];
    questionnaire.questions.forEach((question, index) => {
      if (!question.required) return;
      const value = responses[index];
      if (value === undefined || value === "") {
        missing.push(index);
      }
    });
    return missing;
  };

  const handleSubmit = async () => {
    if (!questionnaire || !user?.id) return;

    const missing = validateResponses();
    if (missing.length > 0) {
      toast({
        title: "Έλεγξε τις απαντήσεις σου",
        description: "Παρακαλώ συμπλήρωσε όλα τα υποχρεωτικά πεδία πριν την υποβολή.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryTrigger = questionnaire.triggers?.[0] ?? "general";

      await questionnaireService.submitResponse({
        questionnaire_id: questionnaire.id,
        user_id: user.id, // REQUIRED as per API docs
        trigger_type: primaryTrigger,
        session_id: `session_${Date.now()}`,
        responses: Object.entries(responses).map(([index, answer]) => ({
          question_index: Number(index),
          answer,
        })),
      });

      toast({
        title: "Ευχαριστούμε!",
        description: "Η απάντησή σου καταχωρήθηκε με επιτυχία.",
      });

      navigate("/questionnaires");
    } catch (error) {
      toast({
        title: "Αποτυχία αποθήκευσης",
        description: error instanceof Error ? error.message : "Δοκίμασε ξανά σε λίγο.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
        {isLoading && !questionnaire ? (
          <Card>
            <CardHeader>
              <CardTitle>Φόρτωση ερωτηματολογίου...</CardTitle>
              <CardDescription>Παρακαλώ περίμενε.</CardDescription>
            </CardHeader>
          </Card>
        ) : !questionnaire ? (
          <Alert variant="destructive">
            <AlertTitle>Δεν βρέθηκε ερωτηματολόγιο</AlertTitle>
            <AlertDescription>
              Το ερωτηματολόγιο που αναζητάς δεν είναι διαθέσιμο. Μπορεί να ολοκληρώθηκε ή να έληξε.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                {questionnaire.triggers?.length ? questionnaire.triggers.join(", ") : "Γενικό"}
              </Badge>
              <CardTitle>{questionnaire.title}</CardTitle>
              {questionnaire.description && (
                <CardDescription>{questionnaire.description}</CardDescription>
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  {totalQuestions} ερωτήσεις • {questionnaire.questions.filter((q) => q.required).length} υποχρεωτικές
                </p>
                <div className="mt-3 space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Ολοκλήρωση {progress}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questionnaire.questions.map((question, index) => (
                <QuestionRenderer
                  key={`${questionnaire.id}-${index}`}
                  question={question}
                  value={responses[index]}
                  onChange={handleChange}
                  index={index}
                />
              ))}

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate("/questionnaires")}
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Άκυρο
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Υποβολή..." : "Υποβολή"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuestionnaireDetailPage;
