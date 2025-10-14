import { buildApiUrl } from "@/config/api";

export interface QuestionnaireOption {
  // Question types as per API docs
  type: "text" | "multiple_choice" | "rating" | "rating_10" | "number" | "yes_no";
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
  user_id: number; // REQUIRED as per API docs
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
  async getActiveQuestionnaires(userId: number, triggerType = "daily"): Promise<Questionnaire[]> {
    // API is now public - user_id is REQUIRED
    if (!userId) {
      console.warn("user_id is required for questionnaires API");
      return [];
    }

    const url = buildUrl("/questionnaires/active", {
      user_id: userId,
    });

    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        // Only log 404 once to avoid spam
        if (!sessionStorage.getItem('questionnaire_404_logged')) {
          console.warn(`📋 Questionnaire endpoint returned 404. Check backend route: ${url}`);
          sessionStorage.setItem('questionnaire_404_logged', 'true');
        }
        return [];
      }

      if (!response.ok) {
        console.error("Failed to fetch active questionnaires", response.status);
        return [];
      }

      const data = await response.json().catch(() => ({}));
      const payload = Array.isArray(data) ? data : data?.data;
      const questionnaires = Array.isArray(payload) ? payload : [];

      // Filter by trigger type on frontend if needed
      if (triggerType && questionnaires.length > 0) {
        return questionnaires.filter((q: Questionnaire) =>
          q.triggers?.includes(triggerType)
        );
      }

      return questionnaires;
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      return [];
    }
  },

  async submitResponse(payload: QuestionnaireResponsePayload) {
    // API is now public - user_id is REQUIRED in payload
    if (!payload.user_id) {
      throw new Error("user_id is required for questionnaire submission");
    }

    const response = await fetch(buildApiUrl("/questionnaire-responses"), {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || "Failed to submit questionnaire");
    }

    return response.json();
  },

  async getUserResponses(userId: number) {
    // API is now public - user_id is REQUIRED
    if (!userId) {
      console.warn("user_id is required for questionnaire responses API");
      return [];
    }

    const url = buildUrl("/questionnaire-responses/user", {
      user_id: userId,
    });

    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch questionnaire responses", response.status);
        return [];
      }

      const data = await response.json().catch(() => ({}));
      const payload = Array.isArray(data) ? data : data?.data;
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      console.error("Error fetching questionnaire responses:", error);
      return [];
    }
  },
};

export type { Questionnaire as QuestionnaireType };
