import { useState, useRef, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Copy, Flag, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatChatMessage } from '@/utils/textFormatter';
import { useToast } from '@/hooks/use-toast';
import { getFallbackResponse, getTimeoutMessage, getEmptyInputMessage } from '@/utils/chatFallbacks';
import DOMPurify from 'dompurify';

interface AIResponse {
  ui_response?: {
    text?: string;
    rich?: string;
    resources?: Array<{
      title: string;
      url: string;
      type: string;
      note?: string;
    }>;
    actions?: Array<{
      type: string;
      label: string;
      url: string;
    }>;
    score?: number;
  };
  fallback_text?: string;
}

const HomepageAIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    currentSession, 
    messages: dbMessages, 
    isLoading: historyLoading,
    saveMessage,
    setMessages: setChatMessages
  } = useChatHistory();

   const location = useLocation();

  useEffect(() => {
      if (location.hash) {
        const section = document.querySelector(location.hash);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, [location]);
  
  // localStorage fallback for guest users
  const [guestMessages, setGuestMessages] = useLocalStorage<any[]>('lovable_ai_session_v1', []);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Processing your question...');
  const [lastUserMessage, setLastUserMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use database messages for logged-in users, localStorage for guests
  const messages = user ? dbMessages : guestMessages;
  const setMessages = user ? (setter: any) => {
    if (typeof setter === 'function') {
      const newMessages = setter(dbMessages);
      // Update local state for immediate display
      return newMessages;
    }
  } : setGuestMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial welcome message if no messages exist
  useEffect(() => {
    if (!historyLoading && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        session_id: currentSession?.id || '',
        role: 'assistant' as const,
        content: "Hi! I'm your AI assistant for international students. I can help you with school applications, scholarships, visa guidance, housing, and much more. What would you like to know?",
        created_at: new Date().toISOString()
      };
      
      if (user && currentSession) {
        saveMessage('assistant', welcomeMessage.content);
      } else {
        setMessages([welcomeMessage]);
      }
    }
  }, [historyLoading, messages.length, currentSession, user]);

  const parseAIResponse = (content: string): AIResponse => {
    try {
      // Try to parse as JSON first
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (error) {
      console.log('Not JSON response, treating as plain text');
    }
    
    // Fallback to plain text
    return {
      ui_response: {
        text: content,
        rich: content
      }
    };
  };

  // Progressive loading message updater
  useEffect(() => {
    if (!isLoading || !loadingStartTime) return;

    const updateLoadingMessage = () => {
      const elapsed = Date.now() - loadingStartTime;
      
      if (elapsed > 20000) {
        setLoadingMessage('Almost done, thank you for waiting...');
      } else if (elapsed > 15000) {
        setLoadingMessage('This is taking longer than usual, please wait...');
      } else if (elapsed > 10000) {
        setLoadingMessage(`Generating response... (${Math.floor(elapsed / 1000)}s)`);
      } else if (elapsed > 5000) {
        setLoadingMessage('Generating response...');
      }
    };

    const interval = setInterval(updateLoadingMessage, 1000);
    return () => clearInterval(interval);
  }, [isLoading, loadingStartTime]);

  const sendMessage = async (retryMessage?: string) => {
    const messageToSend = retryMessage || input.trim();
    
    if (!messageToSend || isLoading) return;

    // Check for empty/very short input
    if (messageToSend.length < 2) {
      const clarificationMsg = {
        id: Date.now().toString(),
        session_id: currentSession?.id || '',
        role: 'assistant' as const,
        content: getEmptyInputMessage(),
        created_at: new Date().toISOString()
      };
      
      if (user && currentSession) {
        setChatMessages(prev => [...prev, clarificationMsg]);
      } else {
        setMessages(prev => [...prev, clarificationMsg]);
      }
      return;
    }

    const userMessageContent = messageToSend;
    setInput('');
    setLastUserMessage(userMessageContent);
    
    // Immediately add user message to UI
    const userMessage = {
      id: Date.now().toString(),
      session_id: currentSession?.id || '',
      role: 'user' as const,
      content: userMessageContent,
      created_at: new Date().toISOString()
    };
    
    if (user && currentSession) {
      // For authenticated users, add to state immediately (saveMessage will update DB)
      setChatMessages(prev => [...prev, userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setLoadingMessage('Processing your question...');

    // Set up timeout and warning
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    const warningTimeoutId = setTimeout(() => {
      if (isLoading) {
        toast({
          title: "Still processing...",
          description: "Your request is taking longer than usual. Please wait a moment.",
        });
      }
    }, 15000); // 15 second warning

    try {
      // Save to database if authenticated
      if (user && currentSession) {
        await saveMessage('user', userMessageContent);
      }

      // Call AI API with session history
      const sessionHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('https://brgguzuobwzbaavaecax.supabase.co/functions/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZ2d1enVvYnd6YmFhdmFlY2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNDgyNzYsImV4cCI6MjA3MjYyNDI3Nn0.UHUg1cMmauQRBm5gkuSKqppH_U-Cqns4M225_4xwqPc',
        },
        body: JSON.stringify({ 
          message: userMessageContent,
          context: 'homepage_assistant',
          session_history: sessionHistory,
          user_profile: user ? { country: 'US', level: 'undergraduate' } : null
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);

      let aiContent: string;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 504 || errorData.error_type === 'TIMEOUT') {
          aiContent = getTimeoutMessage(userMessageContent);
        } else if (response.status === 503 || errorData.error_type === 'NETWORK_ERROR') {
          aiContent = "I'm having trouble connecting. Please check your internet and try again.";
        } else {
          aiContent = getFallbackResponse(userMessageContent);
        }
      } else {
        const data = await response.json();
        aiContent = data?.message || getFallbackResponse(userMessageContent);
      }
      
      if (user && currentSession) {
        await saveMessage('assistant', aiContent);
      } else {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          session_id: '',
          role: 'assistant' as const,
          content: aiContent,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      console.error('Error sending message:', error);
      
      let errorContent: string;
      
      if (error.name === 'AbortError') {
        errorContent = getTimeoutMessage(userMessageContent);
        toast({
          title: "Request Timeout",
          description: "This took longer than expected. Here's a quick answer, or try again.",
        });
      } else {
        errorContent = getFallbackResponse(userMessageContent);
        toast({
          title: "Connection Error",
          description: "Unable to get a response. Here's what I can tell you.",
          variant: "destructive",
        });
      }
      
      if (user && currentSession) {
        await saveMessage('assistant', errorContent);
      } else {
        const errorMessage = {
          id: (Date.now() + 2).toString(),
          session_id: '',
          role: 'assistant' as const,
          content: errorContent,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
      setLoadingMessage('Processing your question...');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Response copied to clipboard.",
    });
  };

  const reportResponse = (messageId: string) => {
    toast({
      title: "Response Reported",
      description: "Thank you for your feedback. We'll review this response.",
    });
  };

  const renderMessage = (message: any) => {
    if (message.role === 'user') {
      return (
        <div className="flex justify-end">
          <div className="max-w-[80%] p-4 rounded-lg bg-primary text-primary-foreground rounded-br-sm">
            <div className="whitespace-pre-wrap">{message.content}</div>
            <p className="text-xs mt-2 opacity-70">
              {new Date(message.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      );
    }

    const parsedResponse = parseAIResponse(message.content);

    if (parsedResponse.fallback_text) {
      return (
        <div className="flex justify-start">
          <div className="max-w-[85%] p-4 rounded-lg bg-muted text-foreground rounded-bl-sm">
            <div className="whitespace-pre-wrap">{parsedResponse.fallback_text}</div>
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyResponse(parsedResponse.fallback_text || '')}
                className="h-7 px-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => reportResponse(message.id)}
                className="h-7 px-2"
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const uiResponse = parsedResponse.ui_response;
    if (!uiResponse) return null;

    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] p-4 rounded-lg bg-muted text-foreground rounded-bl-sm">
          {uiResponse.rich && (
            <div 
              className="prose prose-sm max-w-none mb-3"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(formatChatMessage(uiResponse.rich))
              }}
            />
          )}
          
          {uiResponse.resources && uiResponse.resources.length > 0 && (
            <div className="space-y-2 mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">Resources:</h4>
              {uiResponse.resources.map((resource, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{resource.title}</div>
                    {resource.note && (
                      <div className="text-xs text-muted-foreground">{resource.note}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-7 px-2"
                  >
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uiResponse.actions && uiResponse.actions.length > 0 && (
            <div className="flex gap-2 mb-3">
              {uiResponse.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a 
                    href={action.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {action.label}
                  </a>
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {new Date(message.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyResponse(uiResponse?.text || uiResponse?.rich || '')}
                className="h-7 px-2"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => reportResponse(message.id)}
                className="h-7 px-2"
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <section id="chatSection">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            AI-Powered Student Assistant
          </h2>
          </section>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant, personalized guidance for every step of your international education journey
          </p>
        </div>

        <Card className="shadow-elegant border-primary/10">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">AI</span>
                </div>
                <span className="font-semibold">StudyBridge Assistant</span>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <div className="text-xs opacity-80">
                {user ? 'Saved to profile' : 'Your session is saved locally'}
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="h-96">
            <CardContent className="p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {renderMessage(message)}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-4 rounded-lg rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{loadingMessage}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
          </ScrollArea>

          <div className="p-6 border-t bg-background rounded-b-lg">
            <div className="flex gap-3 mb-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about studying abroad... (Press Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                className="resize-none min-h-[60px] max-h-[120px]"
                rows={2}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="px-6 self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Ask about applications, scholarships, visas, housing & more
              </p>
              {lastUserMessage && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    sendMessage(lastUserMessage);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default HomepageAIAssistant;