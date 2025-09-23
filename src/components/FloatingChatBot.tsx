import { useState } from 'react';
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ChatBot from './ChatBot';
import { cn } from "@/lib/utils";

const FloatingChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else {
      setIsOpen(!isOpen);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <Card 
          className={cn(
            "fixed bottom-20 right-4 w-80 h-96 bg-background/95 backdrop-blur-sm border shadow-elegant z-50 transition-all duration-300",
            isMinimized ? "h-12 overflow-hidden" : "h-96"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-gradient-primary">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground text-sm">
                StudyBridge Assistant
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeChat}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="h-full">
              <ChatBot />
            </div>
          )}
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-4 right-4 h-12 w-12 rounded-full bg-gradient-primary shadow-glow z-40 transition-all duration-300 hover:scale-110",
          isOpen && !isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        size="icon"
      >
        <MessageCircle className="h-5 w-5 text-primary-foreground" />
      </Button>
    </>
  );
};

export default FloatingChatBot;