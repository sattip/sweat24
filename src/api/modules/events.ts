import { apiRequest } from '../../config/api';

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  type: string;
  details: string[];
  is_active: boolean;
  max_attendees: number | null;
  current_attendees: number;
}

export interface EventRSVP {
  id: number;
  event_id: number;
  user_id: number | null;
  guest_name: string | null;
  guest_email: string | null;
  response: string;
  notes: string | null;
  created_at: string;
  event?: Event;
  user?: {
    name: string;
    email: string;
  };
}

export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    return apiRequest('/admin/events');
  },

  createEvent: async (data: Partial<Event>): Promise<Event> => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: number, data: Partial<Event>): Promise<Event> => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: number): Promise<void> => {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  getAllRsvps: async (): Promise<EventRSVP[]> => {
    return apiRequest('/admin/event-rsvps');
  },
};