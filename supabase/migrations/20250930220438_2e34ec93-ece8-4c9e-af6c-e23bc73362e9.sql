-- Fix chat_messages RLS policies to prevent public access
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.chat_messages;

-- Drop and recreate chat_sessions policies without NULL user_id access
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

-- Create secure chat_sessions policies (authenticated users only)
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
ON public.chat_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
ON public.chat_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
ON public.chat_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create secure chat_messages policies (authenticated users only)
CREATE POLICY "Users can view messages from their sessions"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR session_id IN (
    SELECT id FROM public.chat_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their sessions"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR session_id IN (
    SELECT id FROM public.chat_sessions 
    WHERE user_id = auth.uid()
  )
);