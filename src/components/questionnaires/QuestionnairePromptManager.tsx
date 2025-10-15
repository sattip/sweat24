import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  questionnaireService,
  QuestionnaireType,
} from "@/services/questionnaireService";
import {
  deferQuestionnaire,
  getDeferredQuestionnaires,
  getIgnoredQuestionnaires,
  ignoreQuestionnaire,
} from "@/utils/questionnairePreferences";
import { QuestionnairePromptDialog } from "./QuestionnairePromptDialog";

const QUERY_KEY = "questionnaires-active";

export const QuestionnairePromptManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState<QuestionnaireType | null>(null);

  const { data = [] } = useQuery<QuestionnaireType[]>({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return questionnaireService.getActiveQuestionnaires(user.id);
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(user?.id),
  });

  const pickNextQuestionnaire = useCallback((): QuestionnaireType | null => {
    const ignored = getIgnoredQuestionnaires();
    const deferred = getDeferredQuestionnaires();

    return (
      data.find(
        (questionnaire) =>
          !ignored.has(questionnaire.id) && !deferred.has(questionnaire.id)
      ) ?? null
    );
  }, [data]);

  useEffect(() => {
    if (!user?.id) {
      setCurrent(null);
      return;
    }

    if (!data.length) {
      setCurrent(null);
      return;
    }

    const next = pickNextQuestionnaire();
    setCurrent(next);
  }, [data, pickNextQuestionnaire, user?.id]);

  const handleIgnore = useCallback(
    (questionnaire: QuestionnaireType) => {
      ignoreQuestionnaire(questionnaire.id);
      setCurrent(pickNextQuestionnaire());
    },
    [pickNextQuestionnaire]
  );

  const handleLater = useCallback(
    (questionnaire: QuestionnaireType) => {
      deferQuestionnaire(questionnaire.id);
      setCurrent(pickNextQuestionnaire());
    },
    [pickNextQuestionnaire]
  );

  const handleStart = useCallback(
    (questionnaire: QuestionnaireType) => {
      deferQuestionnaire(questionnaire.id);
      navigate(`/questionnaires/${questionnaire.id}`, {
        state: { questionnaire },
      });
      setCurrent(pickNextQuestionnaire());
    },
    [navigate, pickNextQuestionnaire]
  );

  return (
    <QuestionnairePromptDialog
      questionnaire={current}
      open={Boolean(current)}
      onIgnore={handleIgnore}
      onLater={handleLater}
      onStart={handleStart}
    />
  );
};
