import { apiRequest } from "@/config/api";

export interface NotificationTypesResponse {
  types: Record<string, string>;
  icons: Record<string, string>;
  colors: Record<string, string>;
}

export const notificationsApi = {
  getTypes: async (): Promise<NotificationTypesResponse> => {
    return apiRequest('/api/v1/notifications/types');
  },

  getAll: async (params?: { status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `/api/v1/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  create: async (data: any) => {
    return apiRequest('/api/v1/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  send: async (id: number) => {
    return apiRequest(`/api/v1/notifications/${id}/send`, {
      method: 'POST',
    });
  },

  delete: async (id: number) => {
    return apiRequest(`/api/v1/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  getStatistics: async () => {
    return apiRequest('/api/v1/notifications/statistics');
  },
}; 