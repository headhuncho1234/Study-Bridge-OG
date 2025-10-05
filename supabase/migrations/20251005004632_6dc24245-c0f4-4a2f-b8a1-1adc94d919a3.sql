-- Fix RLS policies to support both authenticated and guest users

-- Drop existing restrictive policies on chat_sessions
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

-- Create new policies that support guest users (user_id IS NULL)
CREATE POLICY "Users can view their own sessions or guest sessions"
ON public.chat_sessions
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users can create sessions with their user_id or as guests"
ON public.chat_sessions
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users can update their own sessions or guest sessions"
ON public.chat_sessions
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Users can delete their own sessions or guest sessions"
ON public.chat_sessions
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

-- Drop existing restrictive policies on chat_messages
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.chat_messages;

-- Create new policies that support guest users
CREATE POLICY "Users can view their messages or guest messages"
ON public.chat_messages
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL) OR
  (session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid() OR user_id IS NULL
  ))
);

CREATE POLICY "Users can create messages with their user_id or as guests"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL) OR
  (session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid() OR user_id IS NULL
  ))
);