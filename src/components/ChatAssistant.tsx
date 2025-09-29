import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Minimize2, Maximize2, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChatHistory } from '@/hooks/useChatHistory';
import { formatChatMessage, generateSessionTitle } from '@/utils/textFormatter';
import { useToast } from '@/hooks/use-toast';

const ChatAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    currentSession, 
    messages: chatMessages, 
    isLoading: historyLoading,
    saveMessage, 
    updateSessionTitle,
    setMessages: setChatMessages
  } = useChatHistory();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasInitialMessage, setHasInitialMessage] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Auto-focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Add initial welcome message if no messages exist
  useEffect(() => {
    if (!historyLoading && chatMessages.length === 0 && !hasInitialMessage) {
      const welcomeMessage = {
        id: 'welcome',
        session_id: currentSession?.id || '',
        role: 'assistant' as const,
        content: "Hi! I'm your 24/7 study abroad assistant. I can help you with university applications, visa questions, scholarships, housing, and more. How can I assist you today?",
        created_at: new Date().toISOString()
      };
      setChatMessages([welcomeMessage]);
      setHasInitialMessage(true);
    }
  }, [historyLoading, chatMessages.length, hasInitialMessage, currentSession, setChatMessages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to database if session exists
      if (currentSession) {
        await saveMessage('user', userMessageContent);
        
        // Update session title based on first user message
        if (chatMessages.filter(m => m.role === 'user').length === 0) {
          const title = generateSessionTitle(userMessageContent);
          await updateSessionTitle(title);
        }
      } else {
        // Add to local state if no session (fallback)
        const userMessage = {
          id: Date.now().toString(),
          session_id: '',
          role: 'user' as const,
          content: userMessageContent,
          created_at: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, userMessage]);
      }

      // Call OpenAI API
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message: userMessageContent,
          context: 'study_abroad_assistant'
        }
      });

      if (error) throw error;

      const assistantContent = data?.response || data?.message || 'I apologize, but I encountered an issue. Please try again.';
      
      // Save assistant message to database if session exists
      if (currentSession) {
        await saveMessage('assistant', assistantContent);
      } else {
        // Add to local state if no session (fallback)
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          session_id: '',
          role: 'assistant' as const,
          content: assistantContent,
          created_at: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorContent = 'Unable to get a response at this time. Please try again.';
      
      if (currentSession) {
        await saveMessage('assistant', errorContent);
      } else {
        const errorMessage = {
          id: (Date.now() + 2).toString(),
          session_id: '',
          role: 'assistant' as const,
          content: errorContent,
          created_at: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
      
      toast({
        title: "Connection Error",
        description: "Unable to get a response at this time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleOpen}
          className="h-12 w-12 rounded-full shadow-lg hover-scale"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className={`w-80 shadow-xl border-primary/20 ${isMinimized ? 'h-14' : 'h-96'} transition-all duration-300`}>
        <CardHeader className="p-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium text-sm">24/7 Assistant</span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-white/20 transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-white/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <ScrollArea className="h-64">
              <div className="p-3 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: formatChatMessage(message.content) 
                        }}
                      />
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg rounded-bl-sm shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t bg-background rounded-b-lg">
              <div className="flex gap-2 mb-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything... (Press Enter to send, Shift+Enter for new line)"
                  disabled={isLoading}
                  className="text-sm resize-none min-h-[40px] max-h-[100px]"
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="px-3 self-end"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ask about universities, visas, scholarships, housing & more
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatAssistant;