import { questionnaireService } from '@/services/questionnaireService';
import { toast } from 'sonner';

type TriggerType = 'after_lesson' | 'after_purchase' | 'after_registration';

/**
 * Triggers questionnaire check after specific events
 * Shows toast notification if questionnaires are available
 */
export async function triggerQuestionnaireAfterEvent(
  userId: number,
  triggerType: TriggerType,
  navigate?: (path: string) => void
) {
  try {
    const questionnaires = await questionnaireService.getActiveQuestionnaires(userId, triggerType);

    if (questionnaires.length > 0) {
      const firstQuestionnaire = questionnaires[0];

      // Show toast notification
      toast.success('Νέο Ερωτηματολόγιο! 📋', {
        description: firstQuestionnaire.title,
        duration: 10000, // 10 seconds
        action: {
          label: 'Συμπλήρωση',
          onClick: () => {
            if (navigate) {
              navigate(`/questionnaires/${firstQuestionnaire.id}`);
            } else {
              window.location.href = `/questionnaires/${firstQuestionnaire.id}`;
            }
          },
        },
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to trigger questionnaire:', error);
    return false;
  }
}

/**
 * Get trigger type label in Greek
 */
export function getTriggerTypeLabel(triggerType: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    after_lesson: 'Μετά το μάθημα',
    after_purchase: 'Μετά την αγορά',
    after_registration: 'Μετά την εγγραφή',
  };
  return labels[triggerType] || triggerType;
}
