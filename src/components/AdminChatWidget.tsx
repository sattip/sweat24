import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Check, X, Archive, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { chatApi } from '@/services/apiService';
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
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  messages: Message[];
  status: 'active' | 'resolved' | 'archived';
  last_message_at: string;
  admin_unread_count: number;
  last_message?: Message;
}

export function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Calculate total unread messages
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.admin_unread_count, 0);

  // Fetch conversations when widget opens or tab changes
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, activeTab]);

  // Poll for new messages when widget is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getConversations(activeTab);
      setConversations(response || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read
    if (conversation.admin_unread_count > 0) {
      try {
        await chatApi.markAsRead(conversation.id);
        // Update local state
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, admin_unread_count: 0 }
            : conv
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation || sending) return;

    const messageContent = message.trim();
    setMessage('');
    setSending(true);

    try {
      const response = await chatApi.sendMessage(selectedConversation.id, messageContent);

      // Update selected conversation with new message
      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, response.message]
      });

      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageContent);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const updateConversationStatus = async (status: 'active' | 'resolved' | 'archived') => {
    if (!selectedConversation) return;

    try {
      await chatApi.updateStatus(selectedConversation.id, status);
      setSelectedConversation(null);
      fetchConversations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40",
          "bg-purple-600 hover:bg-purple-700",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500">
            {totalUnread}
          </Badge>
        )}
      </Button>

      {/* Chat Management Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[800px] h-[600px] bg-white rounded-lg shadow-2xl z-50",
          "flex transition-all duration-300 ease-in-out",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-purple-600 text-white rounded-tl-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Συνομιλίες Πελατών</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-purple-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 p-1">
              <TabsTrigger value="active">Ενεργές</TabsTrigger>
              <TabsTrigger value="resolved">Επιλυμένες</TabsTrigger>
              <TabsTrigger value="archived">Αρχείο</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {loading && conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Φόρτωση...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Δεν υπάρχουν {activeTab === 'active' ? 'ενεργές' : activeTab === 'resolved' ? 'επιλυμένες' : 'αρχειοθετημένες'} συνομιλίες
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={cn(
                        "p-4 border-b cursor-pointer hover:bg-gray-50",
                        selectedConversation?.id === conv.id && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conv.user.avatar} />
                          <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conv.user.name}</h4>
                            {conv.admin_unread_count > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {conv.admin_unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conv.user.email}</p>
                          {conv.last_message && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conv.last_message.sender_type === 'user' ? 'Πελάτης: ' : 'Εσείς: '}
                              {conv.last_message.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(conv.last_message_at), 'dd/MM HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Conversation View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.user.avatar} />
                    <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedConversation.user.name}</h4>
                    <p className="text-sm text-gray-500">{selectedConversation.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedConversation.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateConversationStatus('resolved')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Επίλυση
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateConversationStatus('archived')}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Αρχείο
                      </Button>
                    </>
                  )}
                  {selectedConversation.status !== 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateConversationStatus('active')}
                    >
                      Επαναφορά
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.sender_type === 'admin' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender_type === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender.avatar} />
                          <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-4 py-2",
                          msg.sender_type === 'admin'
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            msg.sender_type === 'admin' ? "text-purple-100" : "text-gray-500"
                          )}
                        >
                          {format(new Date(msg.created_at), 'HH:mm', { locale: el })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Πληκτρολογήστε την απάντησή σας..."
                    disabled={sending || selectedConversation.status !== 'active'}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending || selectedConversation.status !== 'active'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <UserCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Επιλέξτε μια συνομιλία για να ξεκινήσετε</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}