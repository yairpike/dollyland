import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TestEmail = () => {
  const sendTestEmail = async () => {
    try {
      toast.info("Sending test email...");
      console.log("Starting test email function call...");
      
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: 'yair.pike@gmail.com',
          inviteCode: 'TEST123',
          inviterName: 'Test User'
        }
      });

      console.log("Function response:", { data, error });

      if (error) {
        console.error('Error sending email:', error);
        toast.error('Failed to send test email');
      } else {
        console.log('Email sent successfully:', data);
        toast.success('Test email sent to yair.pike@gmail.com!');
      }
    } catch (err) {
      console.error('Exception:', err);
      toast.error('Error sending email');
    }
  };

  return (
    <div className="p-4">
      <Button onClick={sendTestEmail}>
        Send Test Email to yair.pike@gmail.com
      </Button>
    </div>
  );
};