import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { chatService } from '@/services/chatService';
import { pusherService } from '@/services/pusherService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  content: string;
  sender_type: 'user' | 'admin';
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: number;
  messages: Message[];
  unread_count: number;
}

export function ChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const isOpenRef = useRef(isOpen);
  
  // Update isOpenRef when isOpen changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Initialize Pusher and fetch initial conversation when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Fetch initial conversation to get unread count
        fetchOrCreateConversation();
        
        pusherService.initialize(user.id, token);
        
        // Subscribe to chat channel
        channelRef.current = pusherService.subscribeToChat(user.id, (payload: any) => {
          // Handle incoming message with backend payload structure
          // Backend sends: { message: {...}, recipient: {...}, isForUser: true }
          if (payload.message && payload.isForUser) {
            const incomingMessage = payload.message;
            
            setConversation(prev => {
              // If no conversation exists yet, create one with the new message
              if (!prev) {
                return {
                  id: incomingMessage.conversation_id || 0,
                  messages: [incomingMessage],
                  unread_count: incomingMessage.sender_type === 'admin' ? 1 : 0
                };
              }
              
              // Add the new message to the conversation
              const newMessage = incomingMessage;
              
              // Check if message already exists to avoid duplicates
              const messageExists = prev.messages.some(m => m.id === newMessage.id);
              if (messageExists) {
                return prev;
              }
              
              // Increase unread count only if chat is closed and message is from admin
              const shouldIncreaseUnread = !isOpenRef.current && newMessage.sender_type === 'admin';
              const newUnreadCount = shouldIncreaseUnread ? prev.unread_count + 1 : prev.unread_count;
              
              return {
                ...prev,
                messages: [...prev.messages, newMessage],
                unread_count: newUnreadCount
              };
            });
            
            // Show toast notification for new admin messages when chat is closed
            if (!isOpenRef.current && incomingMessage.sender_type === 'admin') {
              toast.info('Νέο μήνυμα από την υποστήριξη', {
                description: incomingMessage.content.substring(0, 50) + '...',
                duration: 5000,
              });
            }
          }
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (channelRef.current) {
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id]); // Removed isOpen from dependencies to avoid re-subscribing

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && isAuthenticated && conversation?.id > 0 && conversation?.unread_count > 0) {
      markMessagesAsRead();
    }
  }, [isOpen, isAuthenticated, conversation?.id, conversation?.unread_count]);

  const markMessagesAsRead = async () => {
    if (!conversation || conversation.id <= 0) return;
    
    try {
      await chatService.markAsRead(conversation.id);
      // Update local state to reset unread count
      setConversation(prev => prev ? { ...prev, unread_count: 0 } : null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchOrCreateConversation = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversation();
      if (response) {
        setConversation(response);
      } else {
        // Initialize an empty conversation if none exists
        setConversation({
          id: 0,
          messages: [],
          unread_count: 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      // Initialize an empty conversation on error
      setConversation({
        id: 0,
        messages: [],
        unread_count: 0
      });
      // Only show error if it's not a 404 (conversation not found)
      if (error?.message && !error.message.includes('404')) {
        toast.error('Σφάλμα κατά τη φόρτωση της συνομιλίας');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    const userMessage = message.trim();
    setSending(true);
    setMessage("");

    try {
      // If no conversation exists, the backend will create one
      const conversationId = conversation?.id || 0;
      const response = await chatService.sendMessage(conversationId, userMessage);
      
      // Refresh conversation to get latest messages and proper conversation ID
      await fetchOrCreateConversation();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Σφάλμα κατά την αποστολή μηνύματος');
      setMessage(userMessage); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversation?.messages]);

  // Cleanup Pusher connection on unmount
  useEffect(() => {
    return () => {
      if (!isAuthenticated) {
        pusherService.disconnect();
      }
    };
  }, [isAuthenticated]);

  // Don't render chat widget if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-40 touch-manipulation",
          "bg-blue-600 hover:bg-blue-700",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        {conversation?.unread_count && conversation.unread_count > 0 ? (
          <>
            {/* Pulse animation */}
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 flex h-5 w-5 sm:h-6 sm:w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
            {/* Badge with count */}
            <Badge 
              className={cn(
                "absolute -top-1 -right-1 sm:-top-2 sm:-right-2",
                "min-w-[20px] h-5 sm:min-w-[24px] sm:h-6",
                "rounded-full p-0 flex items-center justify-center",
                "bg-red-500 text-white border-2 border-white",
                "text-xs font-bold",
                "animate-[bounce_2s_ease-in-out_infinite]"
              )}
            >
              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
            </Badge>
          </>
        ) : null}
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6",
          "w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[70vh] sm:h-[600px]",
          "bg-white rounded-lg shadow-2xl z-50",
          "flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src="/logo-light.png" />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">SWEAT93 Support</h3>
              <p className="text-xs text-blue-100">Συνήθως απαντάμε σε λίγα λεπτά</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700 h-8 w-8 p-0 touch-manipulation"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : conversation?.messages.length ? (
            <div className="space-y-3 sm:space-y-4">
              {conversation?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender_type === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[70%] rounded-lg px-3 py-2 sm:px-4 sm:py-2",
                      msg.sender_type === 'user'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        msg.sender_type === 'user' ? "text-blue-100" : "text-gray-500"
                      )}
                    >
                      {format(new Date(msg.created_at), 'HH:mm', { locale: el })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-center px-2">
              <div>
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Ξεκινήστε μια συνομιλία!</p>
                <p className="text-xs text-gray-500 mt-1">Το team μας είναι εδώ για να σας βοηθήσει</p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Πληκτρολογήστε το μήνυμά σας..."
              disabled={sending}
              className="flex-1 text-sm"
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 shrink-0 h-9 w-9 sm:h-10 sm:w-10 p-0 touch-manipulation"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}