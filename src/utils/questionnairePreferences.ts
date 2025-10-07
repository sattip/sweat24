const IGNORE_KEY = "questionnaire_ignore_ids";
const DEFER_KEY = "questionnaire_defer_session";

const safeParse = (value: string | null) => {
  if (!value) return [] as number[];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => Number(item)).filter((num) => !Number.isNaN(num));
    }
    return [] as number[];
  } catch (error) {
    console.error("Failed to parse questionnaire preference", error);
    return [] as number[];
  }
};

const persist = (key: string, values: Iterable<number>, storage: Storage) => {
  const unique = Array.from(new Set(Array.from(values)));
  storage.setItem(key, JSON.stringify(unique));
};

export const getIgnoredQuestionnaires = (): Set<number> => {
  return new Set(safeParse(localStorage.getItem(IGNORE_KEY)));
};

export const ignoreQuestionnaire = (id: number) => {
  const existing = getIgnoredQuestionnaires();
  existing.add(id);
  persist(IGNORE_KEY, existing, localStorage);
};

export const clearIgnoredQuestionnaire = (id: number) => {
  const existing = getIgnoredQuestionnaires();
  if (existing.delete(id)) {
    persist(IGNORE_KEY, existing, localStorage);
  }
};

export const getDeferredQuestionnaires = (): Set<number> => {
  return new Set(safeParse(sessionStorage.getItem(DEFER_KEY)));
};

export const deferQuestionnaire = (id: number) => {
  const existing = getDeferredQuestionnaires();
  existing.add(id);
  persist(DEFER_KEY, existing, sessionStorage);
};

export const clearDeferredQuestionnaire = (id: number) => {
  const existing = getDeferredQuestionnaires();
  if (existing.delete(id)) {
    persist(DEFER_KEY, existing, sessionStorage);
  }
};

export const resetDeferredQuestionnaires = () => {
  sessionStorage.removeItem(DEFER_KEY);
};
