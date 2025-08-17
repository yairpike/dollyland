-- Add UPDATE and DELETE policies for messages table
-- Users should only be able to modify their own messages (role = 'user'), not AI responses

-- Policy to allow users to update their own messages in their conversations
CREATE POLICY "Users can update their own messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  role = 'user' AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Policy to allow users to delete their own messages in their conversations  
CREATE POLICY "Users can delete their own messages in their conversations"
ON public.messages
FOR DELETE
USING (
  role = 'user' AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);