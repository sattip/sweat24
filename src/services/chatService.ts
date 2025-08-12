// Chat service for client app with token authentication
import * as API from '@/config/api';

export const chatService = {
  async getConversation() {
    try {
      const response = await API.apiRequest('/chat/conversation');
      
      if (!response.ok) {
        if (response.status === 404) {
          // No conversation exists yet, return null
          return null;
        }
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }
      
      const data = await response.json();
      return data.conversation || data;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  },
  
  async sendMessage(conversationId: number, content: string) {
    try {
      const body: any = { 
        content: content 
      };
      
      // Only include conversation_id if it's valid
      if (conversationId > 0) {
        body.conversation_id = conversationId;
      }
      
      const response = await API.apiRequest('/chat/messages', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to send message: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      return data.message || data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },
  
  async markAsRead(conversationId: number) {
    const response = await API.apiRequest(`/chat/conversations/${conversationId}/read`, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }
    
    return response.json();
  }
};