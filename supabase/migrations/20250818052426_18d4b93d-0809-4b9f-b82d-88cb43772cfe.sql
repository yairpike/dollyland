-- Update the trigger to use the enhanced function
DROP TRIGGER IF EXISTS validate_message_content_trigger ON public.messages;
CREATE TRIGGER validate_message_content_trigger
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_content_enhanced();