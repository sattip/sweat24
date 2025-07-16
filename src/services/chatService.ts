// Chat service for client app with token authentication
import { apiRequest } from '@/config/api';

export const chatService = {
  async getConversation() {
    const response = await apiRequest('/chat/conversation');
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    
    const data = await response.json();
    return data.conversation;
  },
  
  async sendMessage(userId: number | undefined, content: string) {
    const body: any = { content: content };
    
    const response = await apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    const data = await response.json();
    return data.message;
  },
  
  async markAsRead(conversationId: number) {
    const response = await apiRequest(`/chat/conversations/${conversationId}/read`, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }
    
    return response.json();
  }
};