import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const useChatHistory = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new chat session
  const createSession = async (): Promise<ChatSession | null> => {
    try {
      setError(null);
      const sessionData: any = {
        title: 'New Chat',
        is_active: true
      };

      if (user) {
        sessionData.user_id = user.id;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        setError('Failed to create chat session');
        return null;
      }

      setCurrentSession(data);
      setMessages([]);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  };

  // Load messages for current session
  const loadMessages = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save a message to the current session
  const saveMessage = async (role: 'user' | 'assistant', content: string): Promise<ChatMessage | null> => {
    if (!currentSession) return null;

    try {
      const messageData: any = {
        session_id: currentSession.id,
        role,
        content
      };

      if (user) {
        messageData.user_id = user.id;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        return null;
      }

      // Don't update local state here - caller already handles it
      return data as ChatMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  // Update session title based on first message
  const updateSessionTitle = async (title: string) => {
    if (!currentSession) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', currentSession.id);

      if (error) {
        console.error('Error updating session title:', error);
      } else {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  // Initialize session on mount
  useEffect(() => {
    if (!currentSession) {
      createSession();
    }
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession]);

  return {
    currentSession,
    messages,
    isLoading,
    error,
    createSession,
    saveMessage,
    updateSessionTitle,
    setMessages
  };
};