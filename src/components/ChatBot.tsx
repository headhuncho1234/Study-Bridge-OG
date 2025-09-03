import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI assistant for international students. I can help you with school applications, scholarships, visa guidance, housing, and much more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding')) {
      return "I can help you find scholarships! Here are some options:\n\n🎓 **Merit-based scholarships**: Available in Engineering, Business, and Arts programs\n💰 **Need-based aid**: Up to $15,000 for qualifying students\n🌍 **Country-specific scholarships**: Special programs for students from developing countries\n\nWould you like me to help you find scholarships based on your field of study and budget?";
    }
    
    if (lowerMessage.includes('visa') || lowerMessage.includes('interview')) {
      return "Great question about visa preparation! Here's what I recommend:\n\n📋 **Common F-1 Visa Questions:**\n• Why did you choose this university?\n• How will you finance your studies?\n• What are your plans after graduation?\n\n💡 **Success Tips:**\n• Be honest and confident\n• Bring all required documents\n• Practice your answers beforehand\n\nWould you like me to simulate a visa interview with you?";
    }
    
    if (lowerMessage.includes('housing') || lowerMessage.includes('accommodation')) {
      return "Finding housing can be challenging! Here are your options:\n\n🏠 **On-Campus Housing**: $800-1200/month, includes utilities\n🏘️ **Off-Campus Apartments**: $600-1000/month, more independence\n👥 **Shared Housing**: $400-700/month, great for making friends\n\n📍 I can help you find housing near your university. Which city are you looking at?";
    }
    
    if (lowerMessage.includes('school') || lowerMessage.includes('university') || lowerMessage.includes('college')) {
      return "I'd love to help you find the perfect school! 🎯\n\n**Let me know:**\n• What field do you want to study?\n• What's your budget range?\n• Do you prefer urban or rural campuses?\n• Any specific countries you're considering?\n\nBased on your preferences, I can recommend schools with high acceptance rates for international students and available scholarships.";
    }
    
    if (lowerMessage.includes('mental health') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
      return "Your mental health is important, and you're not alone in feeling this way. 💙\n\n**Resources available:**\n• Campus counseling services (usually free)\n• International student support groups\n• Peer mentorship programs\n• Crisis hotlines: 988 (US), 116 123 (UK)\n\n**Coping strategies:**\n• Connect with other international students\n• Maintain routines from home\n• Join clubs and activities\n\nWould you like help finding mental health resources at your specific university?";
    }

    if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('money')) {
      return "Smart thinking about budgeting! 💰 Here's a typical breakdown:\n\n**Annual Costs (US):**\n• Tuition: $20,000-50,000\n• Housing: $8,000-15,000\n• Food: $3,000-5,000\n• Books/Supplies: $1,000-2,000\n• Personal expenses: $2,000-4,000\n\n**Money-saving tips:**\n• Apply for scholarships early\n• Consider state schools for lower tuition\n• Look into on-campus jobs (up to 20hrs/week)\n\nWhich country are you planning to study in? I can give more specific estimates.";
    }
    
    return "That's a great question! I'm here to help with all aspects of your international student journey:\n\n🎓 **Academic**: School selection, applications, scholarships\n🛂 **Immigration**: Visa guidance, document preparation\n🏠 **Living**: Housing, budgeting, local resources\n👥 **Social**: Community connections, mental health support\n\nCould you be more specific about what you'd like help with? The more details you provide, the better I can assist you!";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          AI-Powered Student Assistant
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get instant, personalized guidance for every step of your international education journey
        </p>
      </div>

      <Card className="shadow-elegant border-0 bg-gradient-card backdrop-blur-sm">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted text-muted-foreground mr-4'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'bot' && (
                    <Bot className="h-5 w-5 mt-1 text-primary shrink-0" />
                  )}
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {message.text}
                  </div>
                  {message.sender === 'user' && (
                    <User className="h-5 w-5 mt-1 text-primary-foreground shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3 mr-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-muted-foreground text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t bg-background/95 backdrop-blur-sm p-4 rounded-b-lg">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about scholarships, visas, housing, or anything else..."
              className="flex-1 border-border/50 focus:border-primary transition-smooth"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-card transition-smooth px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default ChatBot;