import { buildApiUrl } from "@/config/api";

export interface QuestionnaireOption {
  type: "text" | "multiple_choice" | "rating" | "rating_1_10" | "number" | "yes_no";
  question: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export interface Questionnaire {
  id: number;
  title: string;
  description?: string;
  triggers: string[];
  questions: QuestionnaireOption[];
}

export interface QuestionnaireResponsePayload {
  questionnaire_id: number;
  trigger_type: string;
  responses: Array<{
    question_index: number;
    answer: unknown;
  }>;
  session_id?: string;
}

const buildAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  } as const;
};

const buildUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  if (!params) {
    return buildApiUrl(path);
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${buildApiUrl(path)}?${queryString}` : buildApiUrl(path);
};

export const questionnaireService = {
  async getActiveQuestionnaires(userId?: number, triggerType = "daily"): Promise<Questionnaire[]> {
    const url = buildUrl("/questionnaires/active", {
      user_id: userId,
      trigger_type: triggerType,
    });

    const headers = buildAuthHeaders();
    if (!headers) {
      console.warn("Skipping questionnaire fetch – user not authenticated");
      return [];
    }

    const sendRequest = async (targetUrl: string) => {
      const response = await fetch(targetUrl, {
        headers,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        console.error("Failed to fetch active questionnaires", response.status);
        return [];
      }

      const data = await response.json().catch(() => ({}));
      const payload = Array.isArray(data) ? data : data?.data;
      return Array.isArray(payload) ? payload : [];
    };

    const firstAttempt = await sendRequest(url);
    if (firstAttempt === null) {
      const fallbackUrl = buildUrl("/questionnaire/active", {
        user_id: userId,
        trigger_type: triggerType,
      });
      const fallbackResult = await sendRequest(fallbackUrl);
      return Array.isArray(fallbackResult) ? fallbackResult : [];
    }

    return firstAttempt;
  },

  async submitResponse(payload: QuestionnaireResponsePayload) {
    const headers = buildAuthHeaders();
    if (!headers) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(buildApiUrl("/questionnaire-responses"), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || "Failed to submit questionnaire");
    }

    return response.json();
  },

  async getUserResponses(triggerType?: string) {
    const url = buildUrl("/questionnaire-responses/user", {
      trigger_type: triggerType,
    });

    const headers = buildAuthHeaders();
    if (!headers) {
      console.warn("Skipping questionnaire responses fetch – user not authenticated");
      return [];
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      console.error("Failed to fetch questionnaire responses", response.status);
      return [];
    }

    const data = await response.json().catch(() => ({}));
    const payload = Array.isArray(data) ? data : data?.data;
    return Array.isArray(payload) ? payload : [];
  },
};

export type { Questionnaire as QuestionnaireType };
