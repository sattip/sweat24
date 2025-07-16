import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

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
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation when chat opens
  useEffect(() => {
    if (isOpen && user) {
      fetchConversation();
    }
  }, [isOpen, user]);

  // Close chat and clear data when user logs out
  useEffect(() => {
    if (!user || !isAuthenticated) {
      setIsOpen(false);
      setConversation(null);
      setMessage('');
    }
  }, [user, isAuthenticated]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  // Poll for new messages when chat is open
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isOpen) {
      interval = setInterval(fetchConversation, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  const fetchConversation = async () => {
    if (!user?.id) return;
    
    try {
      if (!conversation) {
        setLoading(true);
      }
      const conv = await chatService.getConversation();
      setConversation(conv);
      
      // Mark messages as read
      if (conv.unread_count > 0) {
        await chatService.markAsRead(conv.id);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || sending || !user?.id) return;

    const messageContent = message.trim();
    setMessage('');
    setSending(true);

    try {
      const newMessage = await chatService.sendMessage(undefined, messageContent);

      // Add the new message to the conversation
      if (conversation) {
        setConversation({
          ...conversation,
          messages: [...conversation.messages, newMessage]
        });
      } else {
        // If no conversation exists yet, fetch it
        await fetchConversation();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render anything if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40",
          "bg-blue-600 hover:bg-blue-700",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        {conversation?.unread_count ? (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
            {conversation.unread_count}
          </Badge>
        ) : null}
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50",
          "flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/logo-light.png" />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">SWEAT24 Support</h3>
              <p className="text-xs text-blue-100">Συνήθως απαντάμε σε λίγα λεπτά</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loading && !conversation ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Φόρτωση...</p>
            </div>
          ) : conversation?.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Καλώς ήρθατε στο chat!</p>
              <p className="text-sm text-gray-400 mt-1">Πώς μπορούμε να σας βοηθήσουμε;</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.sender_type === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender_type === 'admin' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender.avatar} />
                      <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-2",
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
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Πληκτρολογήστε το μήνυμά σας..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}