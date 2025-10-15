import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { questionnaireService, QuestionnaireType } from "@/services/questionnaireService";
import { getIgnoredQuestionnaires } from "@/utils/questionnairePreferences";

const QUERY_KEY = "questionnaires-active";

const QuestionnaireSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-40" />
    </CardContent>
  </Card>
);

const QuestionnairesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data = [], isLoading, refetch } = useQuery<QuestionnaireType[]>({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return questionnaireService.getActiveQuestionnaires(user.id);
    },
    enabled: Boolean(user?.id),
  });

  const ignoredIds = getIgnoredQuestionnaires();

  const handleStart = (questionnaire: QuestionnaireType) => {
    navigate(`/questionnaires/${questionnaire.id}`, {
      state: { questionnaire },
    });
  };

  const dueQuestionnaires = data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ερωτηματολόγια</h1>
            <p className="text-sm text-muted-foreground">
              Συμπλήρωσε τα διαθέσιμα ερωτηματολόγια για να βελτιώσουμε την εμπειρία σου.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="w-full sm:w-auto">
            Ανανέωση
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              <QuestionnaireSkeleton />
              <QuestionnaireSkeleton />
            </div>
          ) : dueQuestionnaires.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Δεν υπάρχουν εκκρεμότητες 🎉</CardTitle>
                <CardDescription>
                  Θα σε ενημερώσουμε μόλις υπάρχει νέο ερωτηματολόγιο διαθέσιμο.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {dueQuestionnaires.map((questionnaire) => {
                const isIgnored = ignoredIds.has(questionnaire.id);

                return (
                  <Card key={questionnaire.id} className="border-primary/10 hover:border-primary/40 transition-colors">
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-lg font-semibold">
                          {questionnaire.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {questionnaire.questions.length} ερωτήσεις
                          </Badge>
                          {isIgnored && (
                            <Badge variant="outline">Παράβλεψη ειδοποίησης</Badge>
                          )}
                        </div>
                      </div>
                      {questionnaire.description && (
                        <CardDescription>{questionnaire.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                       <div className="space-y-1 text-sm text-muted-foreground">
                         <p>
                           Triggers: {questionnaire.triggers?.length ? questionnaire.triggers.join(", ") : "—"}
                         </p>
                        <p>
                          Υποχρεωτικές ερωτήσεις: {questionnaire.questions.filter((q) => q.required).length}
                        </p>
                      </div>
                      <Button onClick={() => handleStart(questionnaire)}>
                        Συμπλήρωση
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionnairesPage;
